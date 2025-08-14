const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { sendBillEmail, sendWelcomeEmail } = require('../utils/emailService'); // Update this line
const crypto = require('crypto'); // For generating a unique key

// Controller for checking a guest in
// server/controllers/bookingController.js

exports.checkIn = async (req, res) => {
    const { guestName, guestEmail, expectedCheckOutDate, roomNumber, checkInDate } = req.body;
    
    // All validation remains the same
    if (!guestName || !guestEmail || !expectedCheckOutDate || !roomNumber || !checkInDate) {
        return res.status(400).json({ message: 'Missing required booking information.' });
    }

    try {
        const room = await Room.findOne({ roomNumber: roomNumber });
        if (!room) {
            return res.status(404).json({ message: `Room ${roomNumber} not found.` });
        }

        // The availability check logic is now inside here for final validation
        const start = new Date(checkInDate);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(expectedCheckOutDate);
        end.setUTCHours(0, 0, 0, 0);

        const conflictingBookings = await Booking.find({
            room: room._id,
            $or: [ { status: 'upcoming' }, { status: 'checked-in' } ],
            checkInDate: { $lt: end },
            expectedCheckOutDate: { $gt: start }
        });
        
        if (conflictingBookings.length > 0) {
            return res.status(400).json({ message: 'Error: This room is already booked for the selected dates.' });
        }
        
        const uniqueKey = crypto.randomBytes(16).toString('hex');
        
        const newBooking = new Booking({
            guestName,
            guestEmail,
            checkInDate: new Date(checkInDate), 
            expectedCheckOutDate: new Date(expectedCheckOutDate),
            room: room._id,
            uniqueKey,
            status: 'upcoming', // <-- New bookings are 'upcoming'
            charges: [{ item: 'Room Rent', price: 150 }]
        });
        
        await newBooking.save();
        
        
        const emailWasSent = await sendWelcomeEmail(guestName, guestEmail, uniqueKey);
        
        if (emailWasSent) {
            res.status(201).json({ message: 'Reservation successful! A confirmation key has been sent to the guest\'s email.' });
        } else {
            res.status(201).json({ 
                message: 'Reservation successful, but the email failed. Please provide this key manually.', 
                uniqueKey: uniqueKey
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during check-in.', error });
    }
};
// Controller for checking a guest out
exports.checkOut = async (req, res) => {
    const { uniqueKey } = req.body;

    try {
        const booking = await Booking.findOne({ uniqueKey: uniqueKey, status: 'active' }).populate('room');
        if (!booking) {
            return res.status(404).json({ message: 'No active booking found with this key.' });
        }

        // --- NEW FLAT-RATE BILLING LOGIC ---

        // 1. Calculate the number of nights stayed
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(); // Use the current time for checkout
        const timeDifference = checkOut.getTime() - checkIn.getTime();
        let nightsStayed = Math.ceil(timeDifference / (1000 * 3600 * 24));
        if (nightsStayed <= 0) {
            nightsStayed = 1; // Ensure a minimum of 1 night
        }

        // 2. Calculate the room rent with the flat rate
        const roomRent = nightsStayed * 150; // $150 per day

        // 3. Update the 'Room Rent' charge in the charges array
        const rentChargeIndex = booking.charges.findIndex(charge => charge.item === 'Room Rent');
        if (rentChargeIndex !== -1) {
            booking.charges[rentChargeIndex].price = roomRent;
        } else {
            booking.charges.unshift({ item: 'Room Rent', price: roomRent });
        }
        
        // --- END OF NEW LOGIC ---

        // Calculate final bill with the updated room rent
        const totalBill = booking.charges.reduce((acc, charge) => acc + charge.price, 0);
        booking.totalBill = totalBill;
        booking.checkOutDate = new Date();
        booking.status = 'completed';
        
        // Send email with the final bill
        await sendBillEmail(booking.guestEmail, booking, { charges: booking.charges, total: totalBill });
        
        // Update room status
        const room = await Room.findById(booking.room._id);
        room.status = 'cleaning';
        
        await booking.save();
        await room.save();
        
        res.status(200).json({ message: 'Checkout successful. Bill has been emailed.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during check-out.', error });
    }
};

// Controller to get booking status using the unique key
exports.getBookingStatus = async (req, res) => {
    try {
        // Find a booking that matches the key AND has a status of 'active'.
        const booking = await Booking.findOne({ 
            uniqueKey: req.params.key, 
            status: 'active' // This is the crucial addition
        }).populate('room');

        // If no ACTIVE booking is found, deny access.
        if (!booking) {
            return res.status(404).json({ message: 'No active booking found with this key. It may have been completed.' });
        }

        // isOverstaying will always be evaluated on an active booking now.
        const isOverstaying = booking.isOverstaying(); 

        res.status(200).json({ booking, isOverstaying });

    } catch (error) {
        res.status(500).json({ message: 'Server error.', error });
    }
};

exports.addCharge = async (req, res) => {
    const { uniqueKey, item, price } = req.body;

    if (!uniqueKey || !item || !price) {
        return res.status(400).json({ message: 'Missing required fields: uniqueKey, item, price.' });
    }

    try {
        const booking = await Booking.findOne({ uniqueKey: uniqueKey, status: 'active' });

        if (!booking) {
            return res.status(404).json({ message: 'Active booking not found.' });
        }

        booking.charges.push({ item, price });
        await booking.save();

        res.status(200).json({ message: `${item} added successfully.`, booking });

    } catch (error) {
        res.status(500).json({ message: 'Server error adding charge.', error });
    }
};

// @desc    Get all bookings with search/filter
// @route   GET /api/bookings
// @access  Protected/Admin
exports.getAllBookings = async (req, res) => {
    try {
        const query = {};

        // Filtering by status (e.g., /api/bookings?status=active)
        if (req.query.status) {
            query.status = req.query.status;
        }

        // Searching by guest name (e.g., /api/bookings?search=john)
        if (req.query.search) {
            query.guestName = { $regex: req.query.search, $options: 'i' }; // 'i' for case-insensitive
        }

        const bookings = await Booking.find(query).populate('room').sort({ checkInDate: -1 });
        res.json(bookings);

    } catch (error) {
        res.status(500).json({ message: 'Server error fetching bookings.' });
    }
};

// @desc    Cancel/delete a booking
// @route   DELETE /api/bookings/:id
// @access  Protected/Admin
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Make the room available again
        await Room.updateOne({ _id: booking.room }, { $set: { status: 'available' } });
        
        // Remove the booking
        await booking.deleteOne();

        res.json({ message: 'Booking canceled successfully and room is now available.' });

    } catch (error) {
        res.status(500).json({ message: 'Server error canceling booking.' });
    }
};


// @desc    Cancel/delete a booking and email the final bill
// @route   DELETE /api/bookings/:id
// @access  Protected/Admin
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('room'); // Populate room details

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // If the booking was active, send the final bill
        if (booking.status === 'active') {
            const totalBill = booking.charges.reduce((acc, charge) => acc + charge.price, 0);
            
            // Re-use our email service to send the bill
            await sendBillEmail(booking.guestEmail, booking, { charges: booking.charges, total: totalBill });

            // Make the room available again
            await Room.updateOne({ _id: booking.room._id }, { $set: { status: 'available' } });
        }
        
        // Remove the booking from the database
        await booking.deleteOne();

        res.json({ message: 'Booking canceled successfully. A final bill has been sent to the guest.' });

    } catch (error) {
        console.error(error); // Log the full error for debugging
        res.status(500).json({ message: 'Server error canceling booking.' });
    }
};

// @desc    Generate a report on bookings
// @route   GET /api/bookings/report
// @access  Protected/Admin
exports.getReport = async (req, res) => {
    try {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);

        if (isNaN(startDate) || isNaN(endDate)) {
            return res.status(400).json({ message: 'Please provide valid start and end dates.' });
        }

        // --- Calculations based on date range ---
        const bookings = await Booking.find({
            status: 'completed',
            checkOutDate: { $gte: startDate, $lte: endDate }
        });

        const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalBill, 0);
        
        const popularServices = await Booking.aggregate([
            { $match: { status: 'completed', checkOutDate: { $gte: startDate, $lte: endDate } } },
            { $unwind: '$charges' },
            { $match: { 'charges.item': { $ne: 'Room Rent' } } },
            { $group: { _id: '$charges.item', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // --- CURRENT STATUS Calculations (not based on date range) ---

        // 1. THIS IS THE FIX: We now count currently occupied and total rooms
        const occupiedCount = await Room.countDocuments({ status: 'occupied' });
        const totalRooms = await Room.countDocuments();
        const occupancyRate = totalRooms > 0 ? (occupiedCount / totalRooms) * 100 : 0;
        
        const maintenanceCount = await Room.countDocuments({ status: 'maintenance' });

        // 2. THIS IS THE LINE THAT SENDS THE CORRECT DATA
        res.json({
            totalRevenue: totalRevenue.toFixed(2),
            occupancyRate: occupancyRate.toFixed(2), // Send the new, correct rate
            totalBookings: bookings.length,
            popularServices,
            maintenanceCount: maintenanceCount
        });

    } catch (error){
        console.error(error);
        res.status(500).json({ message: 'Server error generating report.' });
    }
};
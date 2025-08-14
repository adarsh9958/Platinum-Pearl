const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { zonedTimeToUtc } = require('date-fns-tz');


// GET /api/rooms - Get all rooms (Protected)
exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find({}).sort({ roomNumber: 1 });
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching rooms.' });
    }
};

// PUT /api/rooms/:id/status - Update a room's status (Protected)
exports.updateRoomStatus = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (room) {
            room.status = req.body.status || room.status;
            const updatedRoom = await room.save();
            res.json(updatedRoom);
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error updating room status.' });
    }
};

// Get all currently available rooms
exports.getAvailableRooms = async (req, res) => {
    try {
        const availableRooms = await Room.find({ status: 'available' })
                                         .sort({ roomNumber: 1 });
        res.status(200).json(availableRooms);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching rooms.', error });
    }
};

// Check room availability for a given date range
exports.checkAvailability = async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Please provide both start and end dates.' });
    }

    try {
        // The incoming date strings from the client are already in a full format that `new Date()` can parse.
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Validate that the dates were parsed correctly
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Invalid date format. Please provide valid dates.' });
        }

        const conflictingBookings = await Booking.find({
            status: { $ne: 'completed' },
            checkInDate: { $lt: end },
            expectedCheckOutDate: { $gt: start }
        });
        
        const unavailableRoomIds = conflictingBookings.map(booking => booking.room);

        const availableRooms = await Room.find({ 
            _id: { $nin: unavailableRoomIds },
            status: 'available'
        }).sort({ roomNumber: 'asc' });

        res.json(availableRooms);

    } catch (error) {
        console.error("Availability Check Error:", error);
        res.status(500).json({ message: 'Server error checking availability.' });
    }
};

// Get a single room by its ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (room) {
      res.json(room);
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
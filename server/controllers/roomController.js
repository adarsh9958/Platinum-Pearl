const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { zonedTimeToUtc, format } = require('date-fns-tz');


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
    console.log("--- RUNNING SIMPLIFIED AVAILABILITY CHECK ---");
    try {
        // This is the simplest possible query: just find all rooms that are "available".
        const allAvailableRooms = await Room.find({ status: 'available' });

        console.log(`Found ${allAvailableRooms.length} available rooms in the database.`);

        res.json(allAvailableRooms);
        
    } catch (error) {
        console.error("--- SIMPLIFIED CHECK FAILED ---", error);
        res.status(500).json({ message: 'Server error during simplified check.' });
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
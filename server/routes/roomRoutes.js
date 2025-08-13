// server/routes/roomRoutes.js
const express = require('express');
const router = express.Router();

// Verify this line has no typos. The name must match the export exactly.
const { getAvailableRooms,
     getAllRooms,
      updateRoomStatus,
    checkAvailability,
    getRoomById 
 } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

// Public route
router.get('/available', getAvailableRooms);
router.get('/availability', checkAvailability); // This checks for a future date range
router.get('/:id', getRoomById);



// Protected admin routes
router.get('/', protect, getAllRooms);
router.put('/:id/status', protect, updateRoomStatus);

module.exports = router;
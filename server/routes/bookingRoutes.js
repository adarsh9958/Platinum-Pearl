const express = require('express');
const router = express.Router();
const { 
    checkIn, 
    checkOut, 
    getBookingStatus, 
    addCharge,
    getAllBookings, 
    cancelBooking,
    getReport 
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// === Public Routes ===
router.post('/checkin', checkIn);
router.post('/checkout', checkOut);
router.get('/status/:key', getBookingStatus);
router.post('/add-charge', addCharge);

// === Protected Admin Routes ===
router.get('/report', protect, getReport);
router.get('/', protect, getAllBookings);
router.delete('/:id', protect, cancelBooking);

module.exports = router;
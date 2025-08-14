const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  guestEmail: { type: String, required: true },
  checkInDate: { type: Date, default: Date.now },
  checkOutDate: { type: Date },
  expectedCheckOutDate: { type: Date, required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  charges: [{
    item: String,
    price: Number,
    date: { type: Date, default: Date.now }
  }],
  totalBill: { type: Number, default: 0 },
  status: {
    type: String,
    // Add 'upcoming' and 'checked-in' and rename 'active'
    enum: ['upcoming', 'checked-in', 'completed'], 
    default: 'upcoming',
  },
  uniqueKey: { type: String, required: true, unique: true } // Key for guest check-in/out
});

// Method to check for overstaying
bookingSchema.methods.isOverstaying = function() {
    return this.status === 'active' && new Date() > this.expectedCheckOutDate;
};

module.exports = mongoose.model('Booking', bookingSchema);
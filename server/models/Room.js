const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  // Change the type from String to Number
  roomNumber: { type: Number, required: true, unique: true },
  status: {
    type: String,
    enum: ['available', 'occupied', 'cleaning', 'maintenance'],
    default: 'available',
  },
});

module.exports = mongoose.model('Room', roomSchema);
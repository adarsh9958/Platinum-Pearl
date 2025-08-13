// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const bookingRoutes = require('./routes/bookingRoutes');
const roomRoutes = require('./routes/roomRoutes');
const authRoutes = require('./routes/authRoutes');
const Room = require('./models/Room'); // Import Room model for initialization

const app = express();

// Middleware
app.use(cors()); // Allows cross-origin requests (from your frontend)
app.use(express.json()); // Parses incoming JSON requests

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    // Initialize rooms after successful connection
    initializeRooms();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/auth', authRoutes);


// A simple function to check for and create 100 rooms if they don't exist
const initializeRooms = async () => {
  try {
    const count = await Room.countDocuments();
    if (count === 0) {
      console.log('No rooms found. Initializing 100 rooms...');
      const rooms = [];
      for (let i = 1; i <= 100; i++) {
        rooms.push({ roomNumber: i.toString(), status: 'available' });
      }
      await Room.insertMany(rooms);
      console.log('100 rooms have been initialized.');
    } else {
      console.log(`${count} rooms already exist in the database.`);
    }
  } catch (error) {
    console.error('Error initializing rooms:', error);
  }
};

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
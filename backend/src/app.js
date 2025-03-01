// src/app.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const authRoutes = require('./routes/authRoutes');
const crRoutes = require('./routes/crRoutes');
const facultyRoutes = require('./routes/facultyRoutes');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/cr', crRoutes);
app.use('/api/faculty', facultyRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Attendance Management System API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
  });
});

module.exports = app;
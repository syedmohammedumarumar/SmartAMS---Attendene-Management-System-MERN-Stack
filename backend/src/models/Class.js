// src/models/Class.js
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a class name'],
    trim: true,
  },
  totalStudents: {
    type: Number,
    required: [true, 'Please add total number of students'],
    min: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Class', classSchema);
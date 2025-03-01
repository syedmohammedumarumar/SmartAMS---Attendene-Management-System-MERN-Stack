// src/models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  timeSlot: {
    type: String,
    required: [true, 'Please specify the time slot'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  attendance: [
    {
      studentNumber: Number,
      status: {
        type: String,
        enum: ['Present', 'Absent'],
        required: true,
      },
    },
  ],
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Attendance', attendanceSchema);
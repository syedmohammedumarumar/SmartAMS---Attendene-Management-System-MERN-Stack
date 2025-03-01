// src/controllers/facultyController.js
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');

// @desc    View attendance for a specific time slot
// @route   GET /api/faculty/attendance
// @access  Private (Faculty only)
exports.viewAttendance = async (req, res) => {
  try {
    const { timeSlot, date, classId } = req.query;
    
    if (!timeSlot || !classId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide timeSlot and classId',
      });
    }

    // Parse date or use current date
    const queryDate = date ? new Date(date) : new Date();
    queryDate.setHours(0, 0, 0, 0); // Set time to beginning of day

    // Find attendance record
    const attendance = await Attendance.findOne({
      classId,
      timeSlot,
      date: {
        $gte: queryDate,
        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
      },
    }).populate('classId', 'name totalStudents');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'No attendance record found for this time slot and date',
      });
    }

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all available classes for faculty
// @route   GET /api/faculty/classes
// @access  Private (Faculty only)
exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    
    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get attendance summary for a class
// @route   GET /api/faculty/attendance/summary
// @access  Private (Faculty only)
exports.getAttendanceSummary = async (req, res) => {
  try {
    const { classId, startDate, endDate } = req.query;
    
    if (!classId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide classId',
      });
    }

    // Parse dates or use default range (last 30 days)
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999); // End of day
    
    const start = startDate 
      ? new Date(startDate) 
      : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0); // Beginning of day

    // Find attendance records
    const attendanceRecords = await Attendance.find({
      classId,
      date: {
        $gte: start,
        $lte: end,
      },
    }).sort({ date: 1, timeSlot: 1 });

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
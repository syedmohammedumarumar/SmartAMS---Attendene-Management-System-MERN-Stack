const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @desc    Update total number of students in class
// @route   PUT /api/cr/class
// @access  Private (CR only)
exports.updateClassDetails = async (req, res) => {
  try {
    const { totalStudents, className } = req.body;
    
    // Get CR's class
    let classObj = await Class.findById(req.user.classId);
    
    if (!classObj) {
      // If class doesn't exist yet, create one
      classObj = await Class.create({
        name: className || 'Default Class',
        totalStudents: totalStudents,
      });
      
      // Update CR user with classId
      await User.findByIdAndUpdate(req.user.id, {
        classId: classObj._id,
      });
    } else {
      // Update existing class
      classObj.totalStudents = totalStudents;
      if (className) classObj.name = className;
      await classObj.save();
    }

    res.status(200).json({
      success: true,
      data: classObj,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark attendance for a time slot
// @route   POST /api/cr/attendance
// @access  Private (CR only)
exports.markAttendance = async (req, res) => {
  try {
    const { timeSlot, date, attendance } = req.body;
    
    // Validate request
    if (!timeSlot || !attendance || !Array.isArray(attendance)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide timeSlot and attendance array',
      });
    }

    // Check if CR is associated with a class
    if (!req.user.classId) {
      return res.status(400).json({
        success: false,
        message: 'Please setup your class details first',
      });
    }

    // Check if attendance for this time slot and date already exists
    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0); // Set time to beginning of day

    const existingAttendance = await Attendance.findOne({
      classId: req.user.classId,
      timeSlot,
      date: {
        $gte: attendanceDate,
        $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.attendance = attendance;
      await existingAttendance.save();
      
      return res.status(200).json({
        success: true,
        message: 'Attendance updated successfully',
        data: existingAttendance,
      });
    }

    // Create new attendance record
    const newAttendance = await Attendance.create({
      classId: req.user.classId,
      timeSlot,
      date: attendanceDate,
      attendance,
      markedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: newAttendance,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get class details
// @route   GET /api/cr/class
// @access  Private (CR only)
exports.getClassDetails = async (req, res) => {
  try {
    if (!req.user.classId) {
      return res.status(404).json({
        success: false,
        message: 'No class associated with this CR',
      });
    }

    const classObj = await Class.findById(req.user.classId);
    
    if (!classObj) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    res.status(200).json({
      success: true,
      data: classObj,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get attendance records for a specific date
// @route   GET /api/cr/attendance/:date
// @access  Private (CR only)
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;
    
    // Check if CR is associated with a class
    if (!req.user.classId) {
      return res.status(404).json({
        success: false,
        message: 'No class associated with this CR',
      });
    }

    // Convert date string to Date object with time set to beginning of day
    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);
    
    // Find all attendance records for this date and class
    const attendanceRecords = await Attendance.find({
      classId: req.user.classId,
      date: {
        $gte: queryDate,
        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    res.status(200).json({
      success: true,
      data: attendanceRecords,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
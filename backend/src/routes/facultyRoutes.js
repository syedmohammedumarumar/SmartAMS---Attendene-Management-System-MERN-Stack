// src/routes/facultyRoutes.js
const express = require('express');
const { 
  viewAttendance, 
  getClasses,
  getAttendanceSummary
} = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes and authorize only Faculty
router.use(protect);
router.use(authorize('Faculty'));

router.get('/attendance', viewAttendance);
router.get('/attendance/summary', getAttendanceSummary);
router.get('/classes', getClasses);

module.exports = router;
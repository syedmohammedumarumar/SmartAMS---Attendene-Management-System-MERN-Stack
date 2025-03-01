const express = require('express');
const {
  updateClassDetails,
  markAttendance,
  getClassDetails,
  getAttendanceByDate
} = require('../controllers/crController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes and authorize only CR
router.use(protect);
router.use(authorize('CR'));

router.route('/class')
  .get(getClassDetails)
  .put(updateClassDetails);

router.post('/attendance', markAttendance);
router.get('/attendance/:date', getAttendanceByDate);

module.exports = router;
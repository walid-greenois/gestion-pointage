const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getAttendanceHistory,
  getTodayStatus,
  getAttendanceStats
} = require('../controllers/attendanceController');
const { auth, adminAuth } = require('../middleware/auth');
const { attendanceValidation } = require('../middleware/validation');

// All routes require authentication
router.use(auth);

// Employee routes
router.post('/checkin', attendanceValidation, checkIn);
router.post('/checkout', attendanceValidation, checkOut);
router.get('/history', getAttendanceHistory);
router.get('/today', getTodayStatus);

// Admin routes
router.get('/stats', adminAuth, getAttendanceStats);

module.exports = router;

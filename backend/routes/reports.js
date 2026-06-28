const express = require('express');
const router = express.Router();
const { generateAttendanceReport, generateLeaveReport, getDepartments } = require('../controllers/reportController');
const { adminAuth } = require('../middleware/auth');

// All routes are protected and admin-only
router.use(adminAuth);

// Generate attendance report
router.get('/attendance', generateAttendanceReport);

// Generate leave report
router.get('/leave', generateLeaveReport);

// Get available departments
router.get('/departments', getDepartments);

module.exports = router;

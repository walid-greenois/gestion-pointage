const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAttendanceTrends,
  getDepartmentStats,
  getCompanySettings,
  updateCompanySettings
} = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(auth, adminAuth);

router.get('/dashboard', getDashboardStats);
router.get('/trends', getAttendanceTrends);
router.get('/department-stats', getDepartmentStats);
router.get('/settings', getCompanySettings);
router.put('/settings', updateCompanySettings);

module.exports = router;

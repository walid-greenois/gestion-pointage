const express = require('express');
const router = express.Router();
const {
  createLeaveRequest,
  getMyLeaveRequests,
  getAllLeaveRequests,
  reviewLeaveRequest,
  cancelLeaveRequest,
  getLeaveBalance
} = require('../controllers/leaveController');
const { auth, adminAuth } = require('../middleware/auth');
const { leaveRequestValidation } = require('../middleware/validation');

// All routes require authentication
router.use(auth);

// Employee routes
router.post('/', leaveRequestValidation, createLeaveRequest);
router.get('/my-requests', getMyLeaveRequests);
router.get('/balance', getLeaveBalance);
router.put('/:id/cancel', cancelLeaveRequest);

// Admin routes
router.get('/all', adminAuth, getAllLeaveRequests);
router.put('/:id/review', adminAuth, reviewLeaveRequest);

module.exports = router;

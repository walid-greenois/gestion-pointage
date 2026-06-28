const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

// Create leave request
const createLeaveRequest = async (req, res) => {
  try {
    const { type, startDate, endDate, reason, attachments } = req.body;
    const userId = req.user.id;

    // Calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check for overlapping leave requests
    const overlapping = await LeaveRequest.findOne({
      employeeId: userId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlapping) {
      return res.status(400).json({ message: 'You already have a leave request for this period' });
    }

    const leaveRequest = await LeaveRequest.create({
      employeeId: userId,
      companyId: req.user.companyId,
      type,
      startDate: start,
      endDate: end,
      days: diffDays,
      reason,
      attachments: attachments || []
    });

    res.status(201).json({
      success: true,
      leaveRequest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my leave requests
const getMyLeaveRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    let query = { employeeId: userId };

    if (status) {
      query.status = status;
    }

    const leaveRequests = await LeaveRequest.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('reviewedBy', 'firstName lastName');

    const total = await LeaveRequest.countDocuments(query);

    res.json({
      success: true,
      leaveRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all leave requests (Admin)
const getAllLeaveRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const companyId = req.user.companyId;

    let query = { companyId };

    if (status) {
      query.status = status;
    }

    const leaveRequests = await LeaveRequest.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('employeeId', 'firstName lastName employeeId department')
      .populate('reviewedBy', 'firstName lastName');

    const total = await LeaveRequest.countDocuments(query);

    res.json({
      success: true,
      leaveRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve/Reject leave request (Admin)
const reviewLeaveRequest = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const leaveRequestId = req.params.id;

    const leaveRequest = await LeaveRequest.findById(leaveRequestId);

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check if belongs to same company
    if (leaveRequest.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Leave request has already been reviewed' });
    }

    leaveRequest.status = status;
    leaveRequest.reviewedBy = req.user.id;
    leaveRequest.reviewedAt = new Date();
    leaveRequest.reviewComment = comment;

    await leaveRequest.save();

    res.json({
      success: true,
      message: `Leave request ${status} successfully`,
      leaveRequest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel leave request
const cancelLeaveRequest = async (req, res) => {
  try {
    const leaveRequestId = req.params.id;
    const userId = req.user.id;

    const leaveRequest = await LeaveRequest.findById(leaveRequestId);

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check if belongs to current user
    if (leaveRequest.employeeId.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending requests' });
    }

    leaveRequest.status = 'cancelled';
    await leaveRequest.save();

    res.json({
      success: true,
      message: 'Leave request cancelled successfully',
      leaveRequest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get leave balance
const getLeaveBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentYear = new Date().getFullYear();

    // Get approved leave requests for current year
    const approvedLeaves = await LeaveRequest.find({
      employeeId: userId,
      status: 'approved',
      startDate: {
        $gte: new Date(currentYear, 0, 1),
        $lt: new Date(currentYear + 1, 0, 1)
      }
    });

    let usedDays = 0;
    approvedLeaves.forEach(leave => {
      usedDays += leave.days;
    });

    // Standard annual leave: 20 days per year
    const totalAnnualLeave = 20;
    const remainingDays = totalAnnualLeave - usedDays;

    res.json({
      success: true,
      balance: {
        total: totalAnnualLeave,
        used: usedDays,
        remaining: Math.max(0, remainingDays)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createLeaveRequest,
  getMyLeaveRequests,
  getAllLeaveRequests,
  reviewLeaveRequest,
  cancelLeaveRequest,
  getLeaveBalance
};

const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Company = require('../models/Company');
const { isWithinAllowedRadius, calculateWorkHours, isLate, isEarlyDeparture } = require('../utils/locationUtils');
const crypto = require('crypto');

// Check-in
const checkIn = async (req, res) => {
  try {
    const { qrCode, location } = req.body;
    const userId = req.user.id;

    // Get user and company
    const user = await User.findById(userId);
    const company = await Company.findById(user.companyId);

    // Verify QR code
    if (company.qrCodeSecret !== qrCode) {
      return res.status(400).json({ message: 'Invalid QR code' });
    }

    // Verify location if required
    let locationVerified = true;
    if (company.settings.requireLocation) {
      locationVerified = isWithinAllowedRadius(
        location,
        company.location,
        company.location.radius
      );
      
      if (!locationVerified && !company.settings.allowRemoteCheckIn) {
        return res.status(400).json({ message: 'You are not within the allowed company location' });
      }
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingAttendance = await Attendance.findOne({
      employeeId: userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existingAttendance && existingAttendance.checkIn) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    // Get current time
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    // Check if late
    let status = 'present';
    const anomalies = [];
    
    if (isLate(currentTime, user.workSchedule.startTime, company.settings.gracePeriodMinutes)) {
      status = 'late';
      anomalies.push({
        type: 'late_arrival',
        description: `Checked in late at ${currentTime}`,
        severity: 'medium'
      });
    }

    // Create attendance record
    const attendance = await Attendance.create({
      employeeId: userId,
      companyId: user.companyId,
      date: today,
      checkIn: {
        time: currentTime,
        location: location,
        qrCode: qrCode,
        deviceInfo: {
          userAgent: req.headers['user-agent'],
          platform: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop'
        },
        verified: locationVerified || !company.settings.requireLocation,
        verificationMethod: company.settings.requireLocation ? 'both' : 'qr'
      },
      status,
      anomalies
    });

    res.json({
      success: true,
      message: 'Check-in successful',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check-out
const checkOut = async (req, res) => {
  try {
    const { qrCode, location } = req.body;
    const userId = req.user.id;

    // Get user and company
    const user = await User.findById(userId);
    const company = await Company.findById(user.companyId);

    // Verify QR code
    if (company.qrCodeSecret !== qrCode) {
      return res.status(400).json({ message: 'Invalid QR code' });
    }

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.findOne({
      employeeId: userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ message: 'No check-in record found for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    // Get current time
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    // Calculate work hours
    const workHours = calculateWorkHours(attendance.checkIn.time, currentTime);
    const scheduledHours = calculateWorkHours(user.workSchedule.startTime, user.workSchedule.endTime);
    const overtime = Math.max(0, workHours - scheduledHours);

    // Check for early departure
    if (isEarlyDeparture(currentTime, user.workSchedule.endTime)) {
      attendance.status = 'early_departure';
      attendance.anomalies.push({
        type: 'early_departure',
        description: `Checked out early at ${currentTime}`,
        severity: 'medium'
      });
    }

    // Check for insufficient hours
    if (workHours < scheduledHours * 0.8) { // Less than 80% of scheduled hours
      attendance.anomalies.push({
        type: 'insufficient_hours',
        description: `Worked only ${workHours} hours instead of ${scheduledHours}`,
        severity: 'high'
      });
    }

    // Update attendance
    attendance.checkOut = {
      time: currentTime,
      location: location,
      qrCode: qrCode,
      deviceInfo: {
        userAgent: req.headers['user-agent'],
        platform: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop'
      }
    };
    attendance.workHours = {
      scheduled: scheduledHours,
      actual: workHours,
      overtime: overtime
    };
    attendance.updatedAt = new Date();

    await attendance.save();

    res.json({
      success: true,
      message: 'Check-out successful',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance history
const getAttendanceHistory = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    let query = { employeeId: userId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments(query);

    res.json({
      success: true,
      attendance,
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

// Get today's attendance status
const getTodayStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employeeId: userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!attendance) {
      return res.json({
        success: true,
        status: 'not_checked_in',
        attendance: null
      });
    }

    let status = 'checked_in';
    if (attendance.checkOut) {
      status = 'checked_out';
    }

    res.json({
      success: true,
      status,
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance statistics (Admin)
const getAttendanceStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const companyId = req.user.companyId;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const totalEmployees = await User.countDocuments({ companyId, role: 'employee' });
    const totalAttendance = await Attendance.countDocuments({ companyId, ...dateFilter });
    const presentCount = await Attendance.countDocuments({ companyId, ...dateFilter, status: 'present' });
    const lateCount = await Attendance.countDocuments({ companyId, ...dateFilter, status: 'late' });
    const absentCount = await Attendance.countDocuments({ companyId, ...dateFilter, status: 'absent' });

    const attendanceRecords = await Attendance.find({ companyId, ...dateFilter });
    let totalWorkHours = 0;
    let totalOvertime = 0;

    attendanceRecords.forEach(record => {
      if (record.workHours) {
        totalWorkHours += record.workHours.actual || 0;
        totalOvertime += record.workHours.overtime || 0;
      }
    });

    res.json({
      success: true,
      stats: {
        totalEmployees,
        totalAttendance,
        presentCount,
        lateCount,
        absentCount,
        totalWorkHours,
        totalOvertime,
        attendanceRate: totalEmployees > 0 ? ((presentCount / totalAttendance) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getAttendanceHistory,
  getTodayStatus,
  getAttendanceStats
};

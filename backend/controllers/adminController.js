const User = require('../models/User');
const Company = require('../models/Company');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total employees
    const totalEmployees = await User.countDocuments({ companyId, role: 'employee' });

    // Present today
    const presentToday = await Attendance.countDocuments({
      companyId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      'checkIn.time': { $exists: true }
    });

    // Late today
    const lateToday = await Attendance.countDocuments({
      companyId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      status: 'late'
    });

    // Absent today
    const absentToday = totalEmployees - presentToday;

    // Pending leave requests
    const pendingLeaves = await LeaveRequest.countDocuments({
      companyId,
      status: 'pending'
    });

    // This week's attendance
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekAttendance = await Attendance.find({
      companyId,
      date: { $gte: weekStart }
    });

    // Calculate average work hours this week
    let totalWorkHours = 0;
    weekAttendance.forEach(record => {
      if (record.workHours) {
        totalWorkHours += record.workHours.actual || 0;
      }
    });

    const avgWorkHours = weekAttendance.length > 0 
      ? (totalWorkHours / weekAttendance.length).toFixed(2) 
      : 0;

    // Recent anomalies
    const recentAnomalies = await Attendance.find({
      companyId,
      'anomalies.0': { $exists: true }
    })
    .sort({ date: -1 })
    .limit(10)
    .populate('employeeId', 'firstName lastName employeeId');

    res.json({
      success: true,
      stats: {
        totalEmployees,
        presentToday,
        lateToday,
        absentToday,
        pendingLeaves,
        avgWorkHours,
        attendanceRate: totalEmployees > 0 ? ((presentToday / totalEmployees) * 100).toFixed(2) : 0
      },
      recentAnomalies
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance trends (last 30 days)
const getAttendanceTrends = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendance = await Attendance.find({
      companyId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    // Group by date
    const trends = {};
    attendance.forEach(record => {
      const dateStr = record.date.toISOString().split('T')[0];
      if (!trends[dateStr]) {
        trends[dateStr] = {
          present: 0,
          late: 0,
          absent: 0
        };
      }
      
      if (record.status === 'present') trends[dateStr].present++;
      else if (record.status === 'late') trends[dateStr].late++;
      else trends[dateStr].absent++;
    });

    // Convert to array
    const trendsArray = Object.keys(trends).map(date => ({
      date,
      ...trends[date]
    }));

    res.json({
      success: true,
      trends: trendsArray
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get department statistics
const getDepartmentStats = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employees = await User.find({ companyId, role: 'employee' });
    
    const departmentStats = {};
    
    for (const employee of employees) {
      const dept = employee.department || 'Unassigned';
      
      if (!departmentStats[dept]) {
        departmentStats[dept] = {
          totalEmployees: 0,
          presentToday: 0,
          lateToday: 0
        };
      }
      
      departmentStats[dept].totalEmployees++;
      
      const attendance = await Attendance.findOne({
        employeeId: employee._id,
        date: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      });
      
      if (attendance) {
        if (attendance.status === 'present') {
          departmentStats[dept].presentToday++;
        } else if (attendance.status === 'late') {
          departmentStats[dept].lateToday++;
        }
      }
    }

    res.json({
      success: true,
      departmentStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get company settings
const getCompanySettings = async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({
      success: true,
      settings: company.settings,
      location: company.location,
      subscription: company.subscription
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update company settings
const updateCompanySettings = async (req, res) => {
  try {
    const { settings, location } = req.body;
    const company = await Company.findById(req.user.companyId);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    if (settings) {
      company.settings = { ...company.settings, ...settings };
    }

    if (location) {
      company.location = { ...company.location, ...location };
    }

    await company.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: company.settings,
      location: company.location
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAttendanceTrends,
  getDepartmentStats,
  getCompanySettings,
  updateCompanySettings
};

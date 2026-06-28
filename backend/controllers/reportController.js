const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Company = require('../models/Company');
const LeaveRequest = require('../models/LeaveRequest');

console.log('Models loaded successfully');

// Generate attendance report
const generateAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, employeeId, department } = req.query;
    const companyId = req.user.companyId;

    // Build query
    let query = { companyId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // If employeeId is provided, find the user by custom employeeId first
    if (employeeId) {
      const employee = await User.findOne({ companyId, employeeId: employeeId, role: 'employee' });
      if (employee) {
        query.employeeId = employee._id;
      } else {
        // If employee not found, return empty results
        return res.json({
          success: true,
          report: {
            company: { name: '', address: '' },
            period: { startDate: startDate || 'All time', endDate: endDate || 'All time' },
            filters: { employeeId: employeeId || 'All employees', department: department || 'All departments' },
            statistics: { totalRecords: 0, present: 0, late: 0, earlyDeparture: 0, absent: 0, totalWorkHours: 0, totalOvertime: 0 },
            records: []
          }
        });
      }
    }

    // Get attendance records
    const attendanceRecords = await Attendance.find(query)
      .populate('employeeId', 'firstName lastName email department position employeeId')
      .sort({ date: -1 });

    // Filter by department if specified
    let filteredRecords = attendanceRecords;
    if (department) {
      filteredRecords = attendanceRecords.filter(record => 
        record.employeeId.department === department
      );
    }

    // Calculate statistics
    const stats = {
      totalRecords: filteredRecords.length,
      present: filteredRecords.filter(r => r.status === 'present').length,
      late: filteredRecords.filter(r => r.status === 'late').length,
      earlyDeparture: filteredRecords.filter(r => r.status === 'early_departure').length,
      absent: filteredRecords.filter(r => r.status === 'absent').length,
      totalWorkHours: filteredRecords.reduce((sum, r) => sum + (r.workHours?.actual || 0), 0),
      totalOvertime: filteredRecords.reduce((sum, r) => sum + (r.workHours?.overtime || 0), 0)
    };

    // Get company info
    const company = await Company.findById(companyId);

    res.json({
      success: true,
      report: {
        company: {
          name: company.name,
          address: company.address
        },
        period: {
          startDate: startDate || 'All time',
          endDate: endDate || 'All time'
        },
        filters: {
          employeeId: employeeId || 'All employees',
          department: department || 'All departments'
        },
        statistics: stats,
        records: filteredRecords.map(record => ({
          date: record.date,
          employee: {
            name: `${record.employeeId.firstName} ${record.employeeId.lastName}`,
            email: record.employeeId.email,
            department: record.employeeId.department,
            position: record.employeeId.position,
            employeeId: record.employeeId.employeeId
          },
          checkIn: record.checkIn?.time,
          checkOut: record.checkOut?.time,
          status: record.status,
          workHours: record.workHours?.actual || 0,
          overtime: record.workHours?.overtime || 0,
          anomalies: record.anomalies
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate leave report
const generateLeaveReport = async (req, res) => {
  try {
    const { startDate, endDate, employeeId, status } = req.query;
    const companyId = req.user.companyId;

    // Build query
    let query = { companyId };

    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate)
      };
      query.endDate = {
        $lte: new Date(endDate)
      };
    }

    // If employeeId is provided, find the user by custom employeeId first
    if (employeeId) {
      const employee = await User.findOne({ companyId, employeeId: employeeId, role: 'employee' });
      if (employee) {
        query.employeeId = employee._id;
      } else {
        // If employee not found, return empty results
        return res.json({
          success: true,
          report: {
            company: { name: '', address: '' },
            period: { startDate: startDate || 'All time', endDate: endDate || 'All time' },
            filters: { employeeId: employeeId || 'All employees', status: status || 'All statuses' },
            statistics: { totalRequests: 0, pending: 0, approved: 0, rejected: 0, totalDays: 0 },
            requests: []
          }
        });
      }
    }

    if (status) {
      query.status = status;
    }

    // Get leave requests
    const leaveRequests = await LeaveRequest.find(query)
      .populate('employeeId', 'firstName lastName email department position')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      totalRequests: leaveRequests.length,
      pending: leaveRequests.filter(r => r.status === 'pending').length,
      approved: leaveRequests.filter(r => r.status === 'approved').length,
      rejected: leaveRequests.filter(r => r.status === 'rejected').length,
      totalDays: leaveRequests.reduce((sum, r) => sum + (r.days || 0), 0)
    };

    // Get company info
    const company = await Company.findById(companyId);

    res.json({
      success: true,
      report: {
        company: {
          name: company.name,
          address: company.address
        },
        period: {
          startDate: startDate || 'All time',
          endDate: endDate || 'All time'
        },
        filters: {
          employeeId: employeeId || 'All employees',
          status: status || 'All statuses'
        },
        statistics: stats,
        requests: leaveRequests.map(request => ({
          employee: {
            name: `${request.employeeId.firstName} ${request.employeeId.lastName}`,
            email: request.employeeId.email,
            department: request.employeeId.department,
            position: request.employeeId.position
          },
          type: request.type,
          startDate: request.startDate,
          endDate: request.endDate,
          days: request.days,
          reason: request.reason,
          status: request.status,
          createdAt: request.createdAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get available departments
const getDepartments = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    
    const employees = await User.find({ companyId, role: 'employee' });
    const departments = [...new Set(employees.map(e => e.department).filter(d => d))];

    res.json({
      success: true,
      departments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateAttendanceReport,
  generateLeaveReport,
  getDepartments
};

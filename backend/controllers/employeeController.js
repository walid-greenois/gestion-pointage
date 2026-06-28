const User = require('../models/User');
const Attendance = require('../models/Attendance');

// Get all employees (Admin)
const getAllEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department } = req.query;
    const companyId = req.user.companyId;

    let query = { companyId, role: 'employee' };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    if (department) {
      query.department = department;
    }

    const employees = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      employees,
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

// Get employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select('-password');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if belongs to same company
    if (employee.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create employee (Admin)
const createEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, employeeId, department, position, workSchedule } = req.body;

    // Check if employee already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const existingEmployeeId = await User.findOne({ employeeId });
    if (existingEmployeeId) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    const employee = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      employeeId,
      companyId: req.user.companyId,
      department,
      position,
      role: 'employee',
      workSchedule: workSchedule || {
        startTime: '09:00',
        endTime: '17:00',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      }
    });

    res.status(201).json({
      success: true,
      employee: {
        id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        employeeId: employee.employeeId,
        department: employee.department,
        position: employee.position
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update employee (Admin)
const updateEmployee = async (req, res) => {
  try {
    const { firstName, lastName, phone, department, position, workSchedule, isActive } = req.body;

    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if belongs to same company
    if (employee.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedEmployee = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, phone, department, position, workSchedule, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, employee: updatedEmployee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete employee (Admin)
const deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if belongs to same company
    if (employee.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Soft delete - just mark as inactive
    employee.isActive = false;
    await employee.save();

    res.json({ success: true, message: 'Employee deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get employee attendance (Admin)
const getEmployeeAttendance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const employeeId = req.params.id;

    let query = { employeeId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(30);

    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeAttendance
};

const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeAttendance
} = require('../controllers/employeeController');
const { auth, adminAuth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Admin only routes
router.get('/', adminAuth, getAllEmployees);
router.post('/', adminAuth, createEmployee);
router.get('/:id', adminAuth, getEmployeeById);
router.put('/:id', adminAuth, updateEmployee);
router.delete('/:id', adminAuth, deleteEmployee);
router.get('/:id/attendance', adminAuth, getEmployeeAttendance);

module.exports = router;

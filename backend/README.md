# Employee Attendance Management System - Backend

## Overview
This is the backend API for the Employee Attendance Management System, built with Node.js, Express, and MongoDB.

## Features
- JWT Authentication with role-based access control
- QR code generation and verification
- GPS geolocation verification for attendance
- Automatic anomaly detection (late arrivals, early departures)
- Leave request management
- Comprehensive attendance tracking and statistics

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance_db
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

3. Seed the database with initial data:
```bash
node seed.js
```

This will create:
- A sample company (Tech Solutions Inc.)
- An admin user (email: admin@techsolutions.com, password: admin123)
- Sample employees (password: employee123)

4. Start the server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Employees (Admin only)
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/:id/attendance` - Get employee attendance

### Attendance
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/history` - Get attendance history
- `GET /api/attendance/today` - Get today's status
- `GET /api/attendance/stats` - Get statistics (Admin)

### Leave Requests
- `POST /api/leave` - Create leave request
- `GET /api/leave/my-requests` - Get my leave requests
- `GET /api/leave/balance` - Get leave balance
- `PUT /api/leave/:id/cancel` - Cancel leave request
- `GET /api/leave/all` - Get all leave requests (Admin)
- `PUT /api/leave/:id/review` - Review leave request (Admin)

### QR Code
- `GET /api/qrcode/generate` - Generate QR code (Admin)
- `POST /api/qrcode/regenerate` - Regenerate QR secret (Admin)
- `POST /api/qrcode/verify` - Verify QR code

### Admin Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/trends` - Get attendance trends
- `GET /api/admin/department-stats` - Get department statistics
- `GET /api/admin/settings` - Get company settings
- `PUT /api/admin/settings` - Update company settings

## Database Models

### User
- Personal information (name, email, phone)
- Role (admin/employee)
- Company association
- Work schedule
- Employee ID

### Company
- Company information
- Location settings
- Subscription details
- QR code secret
- System settings

### Attendance
- Employee and company references
- Check-in/out data with location
- Status and anomalies
- Work hours calculation

### LeaveRequest
- Employee and company references
- Leave type and dates
- Status tracking
- Review information

## Security Features
- JWT authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation
- Location verification
- QR code verification

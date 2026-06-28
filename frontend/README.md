# Employee Attendance Management System - Frontend

## Overview
This is the frontend application for the Employee Attendance Management System, built with Next.js 14, React, and Tailwind CSS.

## Features
- Modern, responsive UI design
- Role-based dashboards (Admin and Employee)
- QR code scanning for check-in/check-out
- GPS location verification
- Attendance history tracking
- Leave request management
- Real-time statistics and analytics
- Mobile-friendly interface

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Pages

### Authentication
- `/login` - Login page for both admin and employees

### Dashboard
- `/dashboard` - Main dashboard (role-based)
- `/dashboard/attendance` - Attendance history
- `/dashboard/leave` - Leave requests management
- `/dashboard/employees` - Employee management (Admin only)
- `/dashboard/qrcode` - QR code generator (Admin only)

## Components

### UI Components
- `Button` - Reusable button component
- `Card` - Card container components
- `Input` - Form input component
- `Label` - Form label component

### Auth Components
- `LoginForm` - Login form with validation

### Dashboard Components
- `DashboardLayout` - Main layout with sidebar navigation

### Employee Components
- `CheckInOut` - Check-in/check-out functionality with QR scanning
- `AttendanceHistory` - Personal attendance history
- `LeaveRequestForm` - Submit leave requests
- `LeaveRequestsList` - View personal leave requests

### Admin Components
- `AdminDashboard` - Statistics and analytics dashboard
- `EmployeeManagement` - Manage employees
- `LeaveRequestsManagement` - Review leave requests
- `QRCodeGenerator` - Generate company QR codes

## Authentication

The application uses JWT tokens for authentication. Tokens are stored in localStorage and automatically included in API requests.

## Demo Credentials

### Admin
- Email: admin@techsolutions.com
- Password: admin123

### Employee
- Email: john.doe@techsolutions.com
- Password: employee123

## API Integration

The frontend communicates with the backend API using Axios. The API base URL is configured via the `NEXT_PUBLIC_API_URL` environment variable.

## Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

The sidebar automatically collapses on mobile devices and can be toggled via a menu button.

## Technologies Used

- **Next.js 14** - React framework
- **React 18** - UI library
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons
- **date-fns** - Date formatting
- **qrcode.react** - QR code generation
- **react-qr-reader** - QR code scanning (for future implementation)

## Future Enhancements

- Native QR code scanning with camera
- Push notifications
- Offline support
- Export to PDF/Excel
- Advanced analytics and reporting
- Integration with calendar apps

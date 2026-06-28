# Employee Attendance Management System

A comprehensive web application for modern employee attendance tracking using QR codes and GPS geolocation verification.

## 🚀 Features

### Core Functionality
- **QR Code Check-in/Check-out** - Secure attendance tracking via QR code scanning
- **GPS Location Verification** - Prevents fraud by verifying employee location
- **Role-based Access** - Separate dashboards for Admin and Employee
- **Automatic Anomaly Detection** - Detects late arrivals, early departures, and insufficient hours
- **Leave Management** - Submit and review leave requests
- **Real-time Statistics** - Dashboard with attendance analytics and charts
- **Mobile Responsive** - Works seamlessly on desktop, tablet, and mobile devices

### Admin Features
- Employee management (create, update, deactivate)
- Attendance statistics and trends
- Department-wise analytics
- Leave request approval/rejection
- QR code generation and management
- Company settings configuration
- Anomaly monitoring

### Employee Features
- Quick check-in/check-out
- Personal attendance history
- Leave request submission
- Leave balance tracking
- Real-time status updates

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **QRCode** - QR code generation
- **bcryptjs** - Password hashing

### Frontend
- **Next.js 14** - React framework
- **React 18** - UI library
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons
- **date-fns** - Date formatting

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🔧 Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance_db
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Seed the database with initial data:
```bash
node seed.js
```

5. Start the backend server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend application will be available at `http://localhost:3000`

## 👤 Demo Credentials

### Admin Account
- **Email:** admin@techsolutions.com
- **Password:** admin123

### Employee Account
- **Email:** john.doe@techsolutions.com
- **Password:** employee123

## 📁 Project Structure

```
pfa/
├── backend/
│   ├── models/          # Database models (User, Company, Attendance, LeaveRequest)
│   ├── controllers/     # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication and validation
│   ├── utils/           # Utility functions (location calculations)
│   ├── seed.js          # Database seeding script
│   └── server.js        # Entry point
├── frontend/
│   ├── app/             # Next.js app directory
│   ├── components/      # React components
│   ├── contexts/        # React contexts (Auth)
│   ├── lib/             # Utility functions and API client
│   └── public/          # Static assets
└── README.md
```

## 🔐 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation and sanitization
- Location verification for attendance
- QR code verification
- CORS protection
- Secure API endpoints

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Attendance
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/history` - Get history
- `GET /api/attendance/today` - Get today's status
- `GET /api/attendance/stats` - Get statistics (Admin)

### Employees (Admin)
- `GET /api/employees` - List all employees
- `POST /api/employees` - Create employee
- `GET /api/employees/:id` - Get employee details
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Deactivate employee
- `GET /api/employees/:id/attendance` - Get employee attendance

### Leave Requests
- `POST /api/leave` - Create leave request
- `GET /api/leave/my-requests` - Get my requests
- `GET /api/leave/balance` - Get leave balance
- `PUT /api/leave/:id/cancel` - Cancel request
- `GET /api/leave/all` - Get all requests (Admin)
- `PUT /api/leave/:id/review` - Review request (Admin)

### QR Code (Admin)
- `GET /api/qrcode/generate` - Generate QR code
- `POST /api/qrcode/regenerate` - Regenerate QR secret
- `POST /api/qrcode/verify` - Verify QR code

### Admin Dashboard
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/trends` - Attendance trends
- `GET /api/admin/department-stats` - Department statistics
- `GET /api/admin/settings` - Company settings
- `PUT /api/admin/settings` - Update settings

## 🎯 Business Model

This solution follows a SaaS (Software as a Service) subscription model:

### Subscription Plans
- **Basic** - Up to 10 employees
- **Standard** - Up to 50 employees
- **Premium** - Unlimited employees + advanced features

## 🚀 Future Enhancements

- Native mobile applications (iOS/Android)
- Facial recognition for check-in
- NFC badge integration
- Push notifications
- Advanced reporting and analytics
- Export to PDF/Excel
- Integration with payroll systems
- Biometric authentication
- Offline support
- Multi-language support

## 📝 License

This project is created for educational and commercial purposes.

## 👥 Support

For support and inquiries, please contact the development team.

---

**Built with ❤️ using modern web technologies**

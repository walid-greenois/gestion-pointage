const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Company = require('./models/Company');
require('dotenv').config();

// Seed data
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');

    // Clear existing data
    await User.deleteMany({});
    await Company.deleteMany({});
    console.log('Cleared existing data');

    // Create a sample company
    const company = await Company.create({
      name: 'Tech Solutions Inc.',
      email: 'contact@techsolutions.com',
      phone: '+1234567890',
      address: {
        street: '123 Business Ave',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zipCode: '94102'
      },
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 100
      },
      qrCodeSecret: require('crypto').randomBytes(32).toString('hex'),
      subscription: {
        plan: 'premium',
        maxEmployees: 50
      },
      settings: {
        allowRemoteCheckIn: true,
        gracePeriodMinutes: 15,
        requireLocation: true
      }
    });
    console.log('Company created:', company.name);

    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'walidmaati@gmail.com',
      password: 'walidmaati123',
      phone: '+212722847298',
      role: 'admin',
      companyId: company._id,
      employeeId: 'ADMIN001',
      department: 'Management',
      position: 'System Administrator'
    });
    console.log('Admin user created:', admin.email);

    // Create sample employees
    const employees = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'mehdisquali@gmail.com',
        password: 'mehdisquali123',
        phone: '+1234567891',
        role: 'employee',
        companyId: company._id,
        employeeId: 'EMP001',
        department: 'Engineering',
        position: 'Software Developer'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@techsolutions.com',
        password: 'employee123',
        phone: '+1234567892',
        role: 'employee',
        companyId: company._id,
        employeeId: 'EMP002',
        department: 'Marketing',
        position: 'Marketing Manager'
      },
      {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.johnson@techsolutions.com',
        password: 'employee123',
        phone: '+1234567893',
        role: 'employee',
        companyId: company._id,
        employeeId: 'EMP003',
        department: 'HR',
        position: 'HR Specialist'
      }
    ];

    for (const emp of employees) {
      await User.create(emp);
    }
    console.log('Sample employees created');

    console.log('\n=== Seed Data Summary ===');
    console.log('Company:', company.name);
    console.log('Admin Email:', admin.email);
    console.log('Admin Password: walidmaati123');
    console.log('Employee Password: mehdisquali123');
    console.log('\nDatabase seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

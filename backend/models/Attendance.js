const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    time: {
      type: String,
      required: true
    },
    location: {
      latitude: Number,
      longitude: Number,
      accuracy: Number
    },
    qrCode: String,
    deviceInfo: {
      userAgent: String,
      platform: String
    },
    verified: {
      type: Boolean,
      default: false
    },
    verificationMethod: {
      type: String,
      enum: ['qr', 'gps', 'both'],
      default: 'qr'
    }
  },
  checkOut: {
    time: String,
    location: {
      latitude: Number,
      longitude: Number,
      accuracy: Number
    },
    qrCode: String,
    deviceInfo: {
      userAgent: String,
      platform: String
    }
  },
  status: {
    type: String,
    enum: ['present', 'late', 'early_departure', 'absent', 'half_day'],
    default: 'present'
  },
  workHours: {
    scheduled: Number,
    actual: Number,
    overtime: Number
  },
  anomalies: [{
    type: {
      type: String,
      enum: ['late_arrival', 'early_departure', 'insufficient_hours', 'location_mismatch']
    },
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    detectedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
attendanceSchema.index({ employeeId: 1, date: 1 });
attendanceSchema.index({ companyId: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);

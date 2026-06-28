const express = require('express');
const router = express.Router();
const {
  generateQRCode,
  regenerateQRSecret,
  verifyQRCode
} = require('../controllers/qrcodeController');
const { auth, adminAuth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Admin routes
router.get('/generate', adminAuth, generateQRCode);
router.post('/regenerate', adminAuth, regenerateQRSecret);

// Employee route
router.post('/verify', verifyQRCode);

module.exports = router;

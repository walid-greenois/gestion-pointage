const QRCode = require('qrcode');
const Company = require('../models/Company');
const crypto = require('crypto');

// Generate QR code for company
const generateQRCode = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Generate QR code data
    const qrData = {
      companyId: company._id,
      secret: company.qrCodeSecret,
      timestamp: Date.now()
    };

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      qrCode: qrCodeDataURL,
      secret: company.qrCodeSecret
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Regenerate QR code secret (Admin)
const regenerateQRSecret = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Generate new secret
    company.qrCodeSecret = crypto.randomBytes(32).toString('hex');
    await company.save();

    // Generate new QR code
    const qrData = {
      companyId: company._id,
      secret: company.qrCodeSecret,
      timestamp: Date.now()
    };

    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 300,
      margin: 2
    });

    res.json({
      success: true,
      message: 'QR code secret regenerated successfully',
      qrCode: qrCodeDataURL,
      secret: company.qrCodeSecret
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify QR code
const verifyQRCode = async (req, res) => {
  try {
    const { qrCode } = req.body;
    const companyId = req.user.companyId;

    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const isValid = company.qrCodeSecret === qrCode;

    res.json({
      success: true,
      valid: isValid,
      message: isValid ? 'QR code is valid' : 'Invalid QR code'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateQRCode,
  regenerateQRSecret,
  verifyQRCode
};

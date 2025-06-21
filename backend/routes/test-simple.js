const express = require('express');
const { testEmailConfiguration, sendOTPEmail } = require('../utils/emailService');

const router = express.Router();

// @desc    Test email configuration (public for debugging)
// @route   GET /api/test/email-config
// @access  Public
router.get('/email-config', async (req, res) => {
  try {
    const result = await testEmailConfiguration();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Email configuration is working properly',
        details: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Email configuration failed',
        error: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to test email configuration',
      error: error.message
    });
  }
});

// @desc    Send test email (public for debugging)
// @route   POST /api/test/send-email
// @access  Public
router.post('/send-email', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    // Send test OTP email
    const testOTP = '123456';
    const result = await sendOTPEmail(email, testOTP, name);
    
    res.json({
      success: true,
      message: 'Test email sent successfully',
      details: result
    });
  } catch (error) {
    console.error('Test email failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message,
      details: {
        code: error.code,
        command: error.command,
        response: error.response
      }
    });
  }
});

// @desc    Get email environment variables status (public for debugging)
// @route   GET /api/test/email-env
// @access  Public
router.get('/email-env', async (req, res) => {
  try {
    const emailVars = {
      EMAIL_HOST: !!process.env.EMAIL_HOST,
      EMAIL_PORT: !!process.env.EMAIL_PORT,
      EMAIL_USER: !!process.env.EMAIL_USER,
      EMAIL_PASS: !!process.env.EMAIL_PASS,
      FRONTEND_URL: !!process.env.FRONTEND_URL
    };

    const allConfigured = Object.values(emailVars).every(Boolean);

    res.json({
      success: true,
      message: allConfigured ? 'All email environment variables are configured' : 'Some email environment variables are missing',
      variables: emailVars,
      configured: allConfigured
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check email environment variables',
      error: error.message
    });
  }
});

module.exports = router;

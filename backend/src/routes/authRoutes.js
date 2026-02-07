const express = require('express');
const router = express.Router();
const {
  requestOTP,
  verifyOTP,
  getMe,
  updateProfile,
  updateFCMToken
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/request-otp', otpLimiter, requestOTP);
router.post('/verify-otp', authLimiter, verifyOTP);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/fcm-token', protect, updateFCMToken);

module.exports = router;

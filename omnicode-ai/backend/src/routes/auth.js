const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const User = require('../models/User');

// POST /api/auth/verify
// Verifies a Firebase token and creates or returns a user record
router.post('/verify', apiLimiter, authenticate, async (req, res, next) => {
  try {
    const { uid, email, name, picture } = req.firebaseUser;

    let user = await User.findOne({ firebaseUid: uid });

    if (user) {
      user.lastLogin = new Date();
      if (email) user.email = email;
      if (name) user.displayName = name;
      if (picture) user.photoURL = picture;
      await user.save();
    } else {
      user = await User.create({
        firebaseUid: uid,
        email: email || '',
        displayName: name || email || 'Anonymous',
        photoURL: picture || '',
      });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', apiLimiter, authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

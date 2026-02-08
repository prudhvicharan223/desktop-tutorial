const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  about: {
    type: String,
    default: 'Hey there! I am using WhatsApp Clone'
  },
  bio: {
    type: String,
    default: '',
    maxlength: 300
  },
  website: {
    type: String,
    default: ''
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  // Social media stats
  followersCount: {
    type: Number,
    default: 0
  },
  followingCount: {
    type: Number,
    default: 0
  },
  postsCount: {
    type: Number,
    default: 0
  },
  // Creator features
  isCreator: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // User interests for AI feed ranking
  interests: [{
    type: String,
    trim: true
  }],
  otp: {
    code: String,
    expiresAt: Date
  },
  fcmToken: {
    type: String,
    default: ''
  },
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    lastSeenPrivacy: {
      type: String,
      enum: ['everyone', 'contacts', 'nobody'],
      default: 'everyone'
    },
    profilePhotoPrivacy: {
      type: String,
      enum: ['everyone', 'contacts', 'nobody'],
      default: 'everyone'
    },
    readReceipts: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ phoneNumber: 1 });
userSchema.index({ isOnline: 1 });

// Method to generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  };
  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function(otp) {
  if (!this.otp || !this.otp.code) {
    return false;
  }
  
  if (new Date() > this.otp.expiresAt) {
    return false;
  }
  
  return this.otp.code === otp;
};

module.exports = mongoose.model('User', userSchema);

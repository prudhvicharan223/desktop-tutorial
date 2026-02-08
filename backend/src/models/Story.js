const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  mediaUrl: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String
  },
  duration: {
    type: Number, // For videos
    default: 5 // Default 5 seconds for images
  },
  caption: {
    type: String,
    trim: true,
    maxlength: 500
  },
  viewedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  viewsCount: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for performance
storySchema.index({ author: 1, createdAt: -1 });
storySchema.index({ expiresAt: 1 });
storySchema.index({ isActive: 1, expiresAt: 1 });

// Auto-expire stories after 24 hours
storySchema.pre('save', function(next) {
  if (this.isNew) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  }
  next();
});

// Method to check if story is expired
storySchema.methods.isExpired = function() {
  return Date.now() > this.expiresAt;
};

module.exports = mongoose.model('Story', storySchema);

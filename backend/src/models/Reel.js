const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true // In seconds
  },
  caption: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  music: {
    title: String,
    artist: String,
    url: String
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  sharesCount: {
    type: Number,
    default: 0
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  // AI-powered discovery
  engagementScore: {
    type: Number,
    default: 0,
    index: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  // Content moderation
  isReported: {
    type: Boolean,
    default: false
  },
  reportCount: {
    type: Number,
    default: 0
  },
  moderationStatus: {
    type: String,
    enum: ['approved', 'pending', 'rejected', 'removed'],
    default: 'approved'
  }
}, {
  timestamps: true
});

// Indexes for performance
reelSchema.index({ author: 1, createdAt: -1 });
reelSchema.index({ createdAt: -1 });
reelSchema.index({ engagementScore: -1 });
reelSchema.index({ tags: 1 });
reelSchema.index({ isPublic: 1 });

// Method to calculate engagement score
reelSchema.methods.calculateEngagementScore = function() {
  const ageInHours = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  const timeDecay = Math.exp(-0.05 * ageInHours); // Slower decay for reels
  
  this.engagementScore = (
    this.likesCount * 1 +
    this.commentsCount * 2 +
    this.sharesCount * 4 +
    this.viewsCount * 0.2
  ) * timeDecay;
  
  return this.engagementScore;
};

module.exports = mongoose.model('Reel', reelSchema);

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  postType: {
    type: String,
    enum: ['text', 'image', 'video', 'reel'],
    default: 'text'
  },
  content: {
    type: String,
    trim: true,
    maxlength: 5000
  },
  media: [{
    url: String,
    type: {
      type: String,
      enum: ['image', 'video']
    },
    thumbnail: String,
    duration: Number, // For videos
    width: Number,
    height: Number
  }],
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
  // AI-powered feed ranking
  engagementScore: {
    type: Number,
    default: 0,
    index: true
  },
  // Calculated based on likes, comments, shares, views, recency
  rankingScore: {
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
  location: {
    type: String,
    trim: true
  },
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
  isFlagged: {
    type: Boolean,
    default: false
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
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ engagementScore: -1 });
postSchema.index({ rankingScore: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ isPublic: 1 });
postSchema.index({ moderationStatus: 1 });

// Method to calculate engagement score
postSchema.methods.calculateEngagementScore = function() {
  const ageInHours = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  const timeDecay = Math.exp(-0.1 * ageInHours); // Exponential decay
  
  this.engagementScore = (
    this.likesCount * 1 +
    this.commentsCount * 3 +
    this.sharesCount * 5 +
    this.viewsCount * 0.1
  ) * timeDecay;
  
  return this.engagementScore;
};

// Method to calculate ranking score for AI feed
postSchema.methods.calculateRankingScore = function(userInterests = []) {
  const baseScore = this.calculateEngagementScore();
  
  // Tag matching bonus
  const tagBonus = this.tags.filter(tag => 
    userInterests.includes(tag)
  ).length * 10;
  
  this.rankingScore = baseScore + tagBonus;
  return this.rankingScore;
};

module.exports = mongoose.model('Post', postSchema);

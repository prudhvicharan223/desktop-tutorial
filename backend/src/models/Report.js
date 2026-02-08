const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reportedItem: {
    itemType: {
      type: String,
      enum: ['post', 'comment', 'reel', 'user', 'message'],
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'reportedItem.itemType'
    }
  },
  reason: {
    type: String,
    enum: [
      'spam',
      'harassment',
      'hate_speech',
      'violence',
      'nudity',
      'false_information',
      'scam',
      'intellectual_property',
      'other'
    ],
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
    default: 'pending',
    index: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  action: {
    type: String,
    enum: ['none', 'warning', 'content_removed', 'account_suspended', 'account_banned']
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for performance
reportSchema.index({ reporter: 1, createdAt: -1 });
reportSchema.index({ 'reportedItem.itemType': 1, 'reportedItem.itemId': 1 });
reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);

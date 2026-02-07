const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  isGroup: {
    type: Boolean,
    default: false
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  groupName: {
    type: String,
    trim: true
  },
  groupIcon: {
    type: String,
    default: ''
  },
  groupDescription: {
    type: String,
    default: ''
  },
  groupAdmins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
chatSchema.index({ participants: 1 });
chatSchema.index({ isGroup: 1 });
chatSchema.index({ lastMessageTime: -1 });

// Compound index for finding chats by participants
chatSchema.index({ participants: 1, isGroup: 1 });

module.exports = mongoose.model('Chat', chatSchema);

const Message = require('../models/Message');
const Chat = require('../models/Chat');

/**
 * Get messages for a chat
 * @route GET /api/messages/:chatId
 */
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

    // Verify user is part of the chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Get messages with pagination
    const messages = await Message.find({
      chat: chatId,
      deletedFor: { $ne: userId }
    })
      .populate('sender', 'name phoneNumber profilePicture')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Message.countDocuments({
      chat: chatId,
      deletedFor: { $ne: userId }
    });

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      messages: messages.reverse() // Reverse to show oldest first
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages'
    });
  }
};

/**
 * Send a message (handled via WebSocket, this is fallback)
 * @route POST /api/messages
 */
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content, messageType, mediaUrl, replyTo } = req.body;
    const userId = req.user._id;

    // Verify user is part of the chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Create message
    const message = await Message.create({
      chat: chatId,
      sender: userId,
      messageType: messageType || 'text',
      content,
      mediaUrl,
      replyTo,
      status: 'sent'
    });

    // Update chat's last message
    chat.lastMessage = message._id;
    chat.lastMessageTime = message.createdAt;
    await chat.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name phoneNumber profilePicture')
      .populate('replyTo');

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

/**
 * Mark messages as read
 * @route PUT /api/messages/read/:chatId
 */
exports.markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    // Update all unread messages in the chat
    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: userId },
        'readBy.user': { $ne: userId }
      },
      {
        $push: {
          readBy: {
            user: userId,
            readAt: new Date()
          }
        },
        status: 'read'
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
};

/**
 * Delete message
 * @route DELETE /api/messages/:messageId
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { deleteFor } = req.body; // 'me' or 'everyone'
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (deleteFor === 'everyone') {
      // Only sender can delete for everyone
      if (message.sender.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own messages for everyone'
        });
      }

      // Check if message is less than 1 hour old
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (message.createdAt < oneHourAgo) {
        return res.status(400).json({
          success: false,
          message: 'Messages can only be deleted for everyone within 1 hour'
        });
      }

      message.isDeleted = true;
      message.content = 'This message was deleted';
    } else {
      // Delete for me
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
      }
    }

    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

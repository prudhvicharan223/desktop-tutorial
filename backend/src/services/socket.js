const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { sendPushNotification } = require('../utils/pushNotification');

// Store active socket connections
const userSockets = new Map(); // userId -> socketId
const typingUsers = new Map(); // chatId -> Set of userIds

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-otp');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`User connected: ${userId}`);

    // Store socket connection
    userSockets.set(userId, socket.id);

    // Update user online status
    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: new Date()
    });

    // Broadcast online status to user's contacts
    socket.broadcast.emit('user:online', { userId });

    // Join user to their chat rooms
    const userChats = await Chat.find({ participants: userId });
    userChats.forEach(chat => {
      socket.join(chat._id.toString());
    });

    // Handle sending messages
    socket.on('message:send', async (data) => {
      try {
        const { chatId, content, messageType, mediaUrl, replyTo } = data;

        // Verify user is part of the chat
        const chat = await Chat.findOne({
          _id: chatId,
          participants: userId
        });

        if (!chat) {
          return socket.emit('error', { message: 'Chat not found' });
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

        // Send message to all participants in the chat
        io.to(chatId).emit('message:new', populatedMessage);

        // Mark as delivered for online users
        const onlineParticipants = chat.participants.filter(
          id => id.toString() !== userId && userSockets.has(id.toString())
        );

        if (onlineParticipants.length > 0) {
          await Message.findByIdAndUpdate(message._id, {
            status: 'delivered',
            $push: {
              deliveredTo: onlineParticipants.map(id => ({
                user: id,
                deliveredAt: new Date()
              }))
            }
          });

          // Notify sender of delivery
          socket.emit('message:delivered', {
            messageId: message._id,
            chatId
          });
        }

        // Send push notifications to offline users
        const offlineParticipants = await User.find({
          _id: { $in: chat.participants },
          _id: { $ne: userId },
          isOnline: false,
          fcmToken: { $exists: true, $ne: '' }
        });

        for (const participant of offlineParticipants) {
          await sendPushNotification(participant.fcmToken, {
            title: socket.user.name,
            body: messageType === 'text' ? content : `Sent a ${messageType}`,
            data: {
              chatId: chatId,
              messageId: message._id.toString(),
              type: 'new_message'
            }
          });
        }

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message delivery confirmation
    socket.on('message:delivered', async (data) => {
      try {
        const { messageId, chatId } = data;

        await Message.findByIdAndUpdate(messageId, {
          status: 'delivered',
          $push: {
            deliveredTo: {
              user: userId,
              deliveredAt: new Date()
            }
          }
        });

        // Notify sender
        const message = await Message.findById(messageId);
        const senderSocketId = userSockets.get(message.sender.toString());
        
        if (senderSocketId) {
          io.to(senderSocketId).emit('message:delivered', {
            messageId,
            chatId,
            userId
          });
        }
      } catch (error) {
        console.error('Message delivered error:', error);
      }
    });

    // Handle message read confirmation
    socket.on('message:read', async (data) => {
      try {
        const { chatId } = data;

        // Update all unread messages in the chat
        const result = await Message.updateMany(
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

        // Get updated messages
        const updatedMessages = await Message.find({
          chat: chatId,
          sender: { $ne: userId }
        }).select('_id');

        // Notify all participants
        io.to(chatId).emit('messages:read', {
          chatId,
          userId,
          messageIds: updatedMessages.map(m => m._id)
        });

      } catch (error) {
        console.error('Message read error:', error);
      }
    });

    // Handle typing indicator
    socket.on('typing:start', (data) => {
      const { chatId } = data;
      
      if (!typingUsers.has(chatId)) {
        typingUsers.set(chatId, new Set());
      }
      typingUsers.get(chatId).add(userId);

      socket.to(chatId).emit('typing:start', {
        chatId,
        userId,
        userName: socket.user.name
      });
    });

    socket.on('typing:stop', (data) => {
      const { chatId } = data;
      
      if (typingUsers.has(chatId)) {
        typingUsers.get(chatId).delete(userId);
      }

      socket.to(chatId).emit('typing:stop', {
        chatId,
        userId
      });
    });

    // Handle joining a new chat
    socket.on('chat:join', (data) => {
      const { chatId } = data;
      socket.join(chatId);
    });

    // Handle leaving a chat
    socket.on('chat:leave', (data) => {
      const { chatId } = data;
      socket.leave(chatId);
    });

    // Social Media Real-time Events

    // Handle new post notification
    socket.on('post:new', async (data) => {
      try {
        const { postId } = data;
        // Notify followers
        const Follow = require('../models/Follow');
        const followers = await Follow.find({ following: userId }).select('follower');
        
        followers.forEach(follow => {
          const followerSocketId = userSockets.get(follow.follower.toString());
          if (followerSocketId) {
            io.to(followerSocketId).emit('post:new', {
              userId,
              postId,
              userName: socket.user.name,
              userPhoto: socket.user.profilePicture
            });
          }
        });
      } catch (error) {
        console.error('Post notification error:', error);
      }
    });

    // Handle like notification
    socket.on('like:new', async (data) => {
      try {
        const { postId, authorId } = data;
        const authorSocketId = userSockets.get(authorId);
        
        if (authorSocketId && authorId !== userId) {
          io.to(authorSocketId).emit('like:new', {
            postId,
            userId,
            userName: socket.user.name,
            userPhoto: socket.user.profilePicture
          });
        }
      } catch (error) {
        console.error('Like notification error:', error);
      }
    });

    // Handle comment notification
    socket.on('comment:new', async (data) => {
      try {
        const { postId, commentId, authorId } = data;
        const authorSocketId = userSockets.get(authorId);
        
        if (authorSocketId && authorId !== userId) {
          io.to(authorSocketId).emit('comment:new', {
            postId,
            commentId,
            userId,
            userName: socket.user.name,
            userPhoto: socket.user.profilePicture
          });
        }
      } catch (error) {
        console.error('Comment notification error:', error);
      }
    });

    // Handle follow notification
    socket.on('follow:new', async (data) => {
      try {
        const { followedUserId } = data;
        const followedSocketId = userSockets.get(followedUserId);
        
        if (followedSocketId) {
          io.to(followedSocketId).emit('follow:new', {
            userId,
            userName: socket.user.name,
            userPhoto: socket.user.profilePicture,
            isVerified: socket.user.isVerified
          });
        }
      } catch (error) {
        console.error('Follow notification error:', error);
      }
    });

    // Handle story view notification
    socket.on('story:viewed', async (data) => {
      try {
        const { storyId, authorId } = data;
        const authorSocketId = userSockets.get(authorId);
        
        if (authorSocketId && authorId !== userId) {
          io.to(authorSocketId).emit('story:viewed', {
            storyId,
            viewerId: userId,
            viewerName: socket.user.name,
            viewerPhoto: socket.user.profilePicture
          });
        }
      } catch (error) {
        console.error('Story view notification error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId}`);

      // Remove from active sockets
      userSockets.delete(userId);

      // Update user offline status
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date()
      });

      // Broadcast offline status
      socket.broadcast.emit('user:offline', {
        userId,
        lastSeen: new Date()
      });

      // Clear typing indicators
      typingUsers.forEach((users, chatId) => {
        if (users.has(userId)) {
          users.delete(userId);
          io.to(chatId).emit('typing:stop', { chatId, userId });
        }
      });
    });
  });

  return io;
};

module.exports = initializeSocket;

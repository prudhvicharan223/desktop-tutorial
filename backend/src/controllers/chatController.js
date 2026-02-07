const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

/**
 * Get all chats for current user
 * @route GET /api/chats
 */
exports.getChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({
      participants: userId
    })
      .populate('participants', 'name phoneNumber profilePicture isOnline lastSeen')
      .populate('lastMessage')
      .populate('createdBy', 'name phoneNumber')
      .populate('groupAdmins', 'name phoneNumber')
      .sort({ lastMessageTime: -1 });

    res.status(200).json({
      success: true,
      count: chats.length,
      chats
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chats'
    });
  }
};

/**
 * Create or get one-to-one chat
 * @route POST /api/chats/create
 */
exports.createChat = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user._id;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [userId, participantId], $size: 2 }
    })
      .populate('participants', 'name phoneNumber profilePicture isOnline lastSeen')
      .populate('lastMessage');

    if (chat) {
      return res.status(200).json({
        success: true,
        chat
      });
    }

    // Create new chat
    chat = await Chat.create({
      isGroup: false,
      participants: [userId, participantId],
      createdBy: userId
    });

    chat = await Chat.findById(chat._id)
      .populate('participants', 'name phoneNumber profilePicture isOnline lastSeen')
      .populate('lastMessage');

    res.status(201).json({
      success: true,
      chat
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat'
    });
  }
};

/**
 * Create group chat
 * @route POST /api/chats/group
 */
exports.createGroup = async (req, res) => {
  try {
    const { groupName, participantIds, groupDescription, groupIcon } = req.body;
    const userId = req.user._id;

    if (!groupName || !participantIds || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Group name and participants are required'
      });
    }

    // Add creator to participants if not included
    const participants = [...new Set([userId.toString(), ...participantIds])];

    // Create group
    const group = await Chat.create({
      isGroup: true,
      groupName,
      groupDescription: groupDescription || '',
      groupIcon: groupIcon || '',
      participants,
      groupAdmins: [userId],
      createdBy: userId
    });

    const populatedGroup = await Chat.findById(group._id)
      .populate('participants', 'name phoneNumber profilePicture')
      .populate('groupAdmins', 'name phoneNumber')
      .populate('createdBy', 'name phoneNumber');

    res.status(201).json({
      success: true,
      group: populatedGroup
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create group'
    });
  }
};

/**
 * Get single chat details
 * @route GET /api/chats/:chatId
 */
exports.getChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    })
      .populate('participants', 'name phoneNumber profilePicture isOnline lastSeen')
      .populate('groupAdmins', 'name phoneNumber')
      .populate('createdBy', 'name phoneNumber');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.status(200).json({
      success: true,
      chat
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat'
    });
  }
};

/**
 * Update group details
 * @route PUT /api/chats/group/:chatId
 */
exports.updateGroup = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { groupName, groupDescription, groupIcon } = req.body;
    const userId = req.user._id;

    // Find group
    const group = await Chat.findOne({
      _id: chatId,
      isGroup: true,
      participants: userId
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is admin
    if (!group.groupAdmins.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only group admins can update group details'
      });
    }

    // Update group
    if (groupName) group.groupName = groupName;
    if (groupDescription) group.groupDescription = groupDescription;
    if (groupIcon) group.groupIcon = groupIcon;

    await group.save();

    const updatedGroup = await Chat.findById(chatId)
      .populate('participants', 'name phoneNumber profilePicture')
      .populate('groupAdmins', 'name phoneNumber');

    res.status(200).json({
      success: true,
      group: updatedGroup
    });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update group'
    });
  }
};

/**
 * Add participants to group
 * @route POST /api/chats/group/:chatId/add-participants
 */
exports.addParticipants = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { participantIds } = req.body;
    const userId = req.user._id;

    if (!participantIds || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Participant IDs are required'
      });
    }

    const group = await Chat.findOne({
      _id: chatId,
      isGroup: true,
      participants: userId
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is admin
    if (!group.groupAdmins.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only group admins can add participants'
      });
    }

    // Add new participants
    participantIds.forEach(id => {
      if (!group.participants.includes(id)) {
        group.participants.push(id);
      }
    });

    await group.save();

    const updatedGroup = await Chat.findById(chatId)
      .populate('participants', 'name phoneNumber profilePicture');

    res.status(200).json({
      success: true,
      group: updatedGroup
    });
  } catch (error) {
    console.error('Add participants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add participants'
    });
  }
};

/**
 * Remove participant from group
 * @route POST /api/chats/group/:chatId/remove-participant
 */
exports.removeParticipant = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { participantId } = req.body;
    const userId = req.user._id;

    const group = await Chat.findOne({
      _id: chatId,
      isGroup: true,
      participants: userId
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is admin
    if (!group.groupAdmins.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only group admins can remove participants'
      });
    }

    // Remove participant
    group.participants = group.participants.filter(
      id => id.toString() !== participantId
    );

    // Remove from admins if they were admin
    group.groupAdmins = group.groupAdmins.filter(
      id => id.toString() !== participantId
    );

    await group.save();

    const updatedGroup = await Chat.findById(chatId)
      .populate('participants', 'name phoneNumber profilePicture')
      .populate('groupAdmins', 'name phoneNumber');

    res.status(200).json({
      success: true,
      group: updatedGroup
    });
  } catch (error) {
    console.error('Remove participant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove participant'
    });
  }
};

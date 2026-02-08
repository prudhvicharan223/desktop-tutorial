const Follow = require('../models/Follow');
const User = require('../models/User');

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;
    
    // Can't follow yourself
    if (userId === followerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself'
      });
    }
    
    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: userId
    });
    
    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user'
      });
    }
    
    // Create follow relationship
    const follow = new Follow({
      follower: followerId,
      following: userId
    });
    
    await follow.save();
    
    // Update counts
    await User.findByIdAndUpdate(followerId, {
      $inc: { followingCount: 1 }
    });
    
    await User.findByIdAndUpdate(userId, {
      $inc: { followersCount: 1 }
    });
    
    res.status(201).json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to follow user',
      error: error.message
    });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;
    
    const follow = await Follow.findOneAndDelete({
      follower: followerId,
      following: userId
    });
    
    if (!follow) {
      return res.status(404).json({
        success: false,
        message: 'Not following this user'
      });
    }
    
    // Update counts
    await User.findByIdAndUpdate(followerId, {
      $inc: { followingCount: -1 }
    });
    
    await User.findByIdAndUpdate(userId, {
      $inc: { followersCount: -1 }
    });
    
    res.json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to unfollow user',
      error: error.message
    });
  }
};

// Get followers
exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const followers = await Follow.find({ following: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('follower', 'name profilePicture isVerified followersCount')
      .lean();
    
    const followerUsers = followers.map(f => f.follower);
    
    res.json({
      success: true,
      data: followerUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: followers.length === parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch followers',
      error: error.message
    });
  }
};

// Get following
exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const following = await Follow.find({ follower: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('following', 'name profilePicture isVerified followersCount')
      .lean();
    
    const followingUsers = following.map(f => f.following);
    
    res.json({
      success: true,
      data: followingUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: following.length === parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch following',
      error: error.message
    });
  }
};

// Check if following a user
exports.checkFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;
    
    const isFollowing = await Follow.exists({
      follower: followerId,
      following: userId
    });
    
    res.json({
      success: true,
      data: {
        isFollowing: !!isFollowing
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check following status',
      error: error.message
    });
  }
};

module.exports = exports;

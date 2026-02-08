const Reel = require('../models/Reel');
const User = require('../models/User');

// Create a reel
exports.createReel = async (req, res) => {
  try {
    const { videoUrl, thumbnail, duration, caption, music, tags, mentions, isPublic } = req.body;
    
    const reel = new Reel({
      author: req.user.userId,
      videoUrl,
      thumbnail,
      duration,
      caption,
      music,
      tags: tags || [],
      mentions: mentions || [],
      isPublic: isPublic !== undefined ? isPublic : true
    });
    
    await reel.save();
    await reel.populate('author', 'name profilePicture isVerified');
    
    res.status(201).json({
      success: true,
      data: reel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create reel',
      error: error.message
    });
  }
};

// Get reels feed
exports.getReels = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.userId;
    
    // Get user's interests
    const user = await User.findById(userId).select('interests');
    const userInterests = user.interests || [];
    
    // Get reels sorted by engagement score
    const reels = await Reel.find({
      isPublic: true,
      moderationStatus: 'approved'
    })
      .sort({ engagementScore: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'name profilePicture isVerified')
      .lean();
    
    // Calculate personalized scores
    reels.forEach(reel => {
      const tagBonus = reel.tags.filter(tag => 
        userInterests.includes(tag)
      ).length * 10;
      reel.personalizedScore = reel.engagementScore + tagBonus;
    });
    
    // Re-sort by personalized score
    reels.sort((a, b) => b.personalizedScore - a.personalizedScore);
    
    // Check if user has liked each reel
    reels.forEach(reel => {
      reel.isLiked = reel.likes.some(like => like.toString() === userId.toString());
    });
    
    res.json({
      success: true,
      data: reels,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: reels.length === parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reels',
      error: error.message
    });
  }
};

// Get a single reel
exports.getReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    
    const reel = await Reel.findById(reelId)
      .populate('author', 'name profilePicture isVerified followersCount')
      .lean();
    
    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }
    
    // Check if user has liked the reel
    reel.isLiked = reel.likes.some(like => like.toString() === req.user.userId.toString());
    
    res.json({
      success: true,
      data: reel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reel',
      error: error.message
    });
  }
};

// Get user's reels
exports.getUserReels = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 12 } = req.query;
    
    const reels = await Reel.find({
      author: userId,
      moderationStatus: 'approved'
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-likes')
      .lean();
    
    res.json({
      success: true,
      data: reels,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: reels.length === parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user reels',
      error: error.message
    });
  }
};

// Like a reel
exports.likeReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    const userId = req.user.userId;
    
    const reel = await Reel.findById(reelId);
    
    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }
    
    // Check if already liked
    const alreadyLiked = reel.likes.includes(userId);
    
    if (alreadyLiked) {
      // Unlike
      reel.likes = reel.likes.filter(id => id.toString() !== userId.toString());
      reel.likesCount = Math.max(0, reel.likesCount - 1);
    } else {
      // Like
      reel.likes.push(userId);
      reel.likesCount += 1;
    }
    
    // Recalculate engagement score
    reel.calculateEngagementScore();
    
    await reel.save();
    
    res.json({
      success: true,
      data: {
        isLiked: !alreadyLiked,
        likesCount: reel.likesCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to like reel',
      error: error.message
    });
  }
};

// Share a reel
exports.shareReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    
    const reel = await Reel.findByIdAndUpdate(
      reelId,
      { $inc: { sharesCount: 1 } },
      { new: true }
    );
    
    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }
    
    // Recalculate engagement score
    reel.calculateEngagementScore();
    await reel.save();
    
    res.json({
      success: true,
      data: {
        sharesCount: reel.sharesCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to share reel',
      error: error.message
    });
  }
};

// Update view count
exports.viewReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    
    const reel = await Reel.findByIdAndUpdate(
      reelId,
      { $inc: { viewsCount: 1 } },
      { new: true }
    );
    
    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        viewsCount: reel.viewsCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update view count',
      error: error.message
    });
  }
};

// Delete a reel
exports.deleteReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    const userId = req.user.userId;
    
    const reel = await Reel.findById(reelId);
    
    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }
    
    // Check if user is the author
    if (reel.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this reel'
      });
    }
    
    await Reel.findByIdAndDelete(reelId);
    
    res.json({
      success: true,
      message: 'Reel deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete reel',
      error: error.message
    });
  }
};

module.exports = exports;

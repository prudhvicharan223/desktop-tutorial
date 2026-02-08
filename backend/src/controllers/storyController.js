const Story = require('../models/Story');
const User = require('../models/User');
const Follow = require('../models/Follow');

// Create a story
exports.createStory = async (req, res) => {
  try {
    const { mediaType, mediaUrl, thumbnail, duration, caption } = req.body;
    
    const story = new Story({
      author: req.user.userId,
      mediaType,
      mediaUrl,
      thumbnail,
      duration: duration || (mediaType === 'video' ? null : 5),
      caption
    });
    
    await story.save();
    await story.populate('author', 'name profilePicture isVerified');
    
    res.status(201).json({
      success: true,
      data: story
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create story',
      error: error.message
    });
  }
};

// Get stories from followed users
exports.getStories = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get users that current user follows
    const following = await Follow.find({ follower: userId }).select('following');
    const followingIds = following.map(f => f.following);
    followingIds.push(userId); // Include own stories
    
    // Get active stories from followed users
    const stories = await Story.aggregate([
      {
        $match: {
          author: { $in: followingIds },
          isActive: true,
          expiresAt: { $gt: new Date() }
        }
      },
      {
        $group: {
          _id: '$author',
          stories: {
            $push: {
              _id: '$_id',
              mediaType: '$mediaType',
              mediaUrl: '$mediaUrl',
              thumbnail: '$thumbnail',
              duration: '$duration',
              caption: '$caption',
              viewsCount: '$viewsCount',
              createdAt: '$createdAt',
              expiresAt: '$expiresAt'
            }
          },
          latestStory: { $max: '$createdAt' }
        }
      },
      {
        $sort: { latestStory: -1 }
      }
    ]);
    
    // Populate author details
    await User.populate(stories, {
      path: '_id',
      select: 'name profilePicture isVerified'
    });
    
    // Transform the data
    const transformedStories = stories.map(s => ({
      author: s._id,
      stories: s.stories
    }));
    
    res.json({
      success: true,
      data: transformedStories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stories',
      error: error.message
    });
  }
};

// Get a user's stories
exports.getUserStories = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const stories = await Story.find({
      author: userId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    })
      .sort({ createdAt: 1 })
      .lean();
    
    // Mark as viewed
    const viewerId = req.user.userId;
    if (userId !== viewerId.toString()) {
      for (const story of stories) {
        const storyDoc = await Story.findById(story._id);
        const alreadyViewed = storyDoc.viewedBy.some(
          v => v.user.toString() === viewerId.toString()
        );
        
        if (!alreadyViewed) {
          storyDoc.viewedBy.push({ user: viewerId });
          storyDoc.viewsCount += 1;
          await storyDoc.save();
        }
      }
    }
    
    res.json({
      success: true,
      data: stories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user stories',
      error: error.message
    });
  }
};

// Get story viewers
exports.getStoryViewers = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.userId;
    
    const story = await Story.findById(storyId);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }
    
    // Check if user is the author
    if (story.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view story viewers'
      });
    }
    
    await story.populate('viewedBy.user', 'name profilePicture isVerified');
    
    res.json({
      success: true,
      data: story.viewedBy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch story viewers',
      error: error.message
    });
  }
};

// Delete a story
exports.deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.userId;
    
    const story = await Story.findById(storyId);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }
    
    // Check if user is the author
    if (story.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this story'
      });
    }
    
    story.isActive = false;
    await story.save();
    
    res.json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete story',
      error: error.message
    });
  }
};

// Cleanup expired stories (background task)
exports.cleanupExpiredStories = async () => {
  try {
    await Story.updateMany(
      {
        isActive: true,
        expiresAt: { $lt: new Date() }
      },
      {
        $set: { isActive: false }
      }
    );
  } catch (error) {
    console.error('Failed to cleanup expired stories:', error);
  }
};

module.exports = exports;

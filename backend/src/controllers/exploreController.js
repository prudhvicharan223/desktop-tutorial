const Post = require('../models/Post');
const Reel = require('../models/Reel');
const User = require('../models/User');

// Get explore feed with AI discovery
exports.getExploreFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20, type = 'all' } = req.query;
    const userId = req.user.userId;
    
    // Get user's interests
    const user = await User.findById(userId).select('interests');
    const userInterests = user.interests || [];
    
    let content = [];
    
    if (type === 'all' || type === 'posts') {
      const posts = await Post.find({
        author: { $ne: userId }, // Exclude own posts
        isPublic: true,
        moderationStatus: 'approved'
      })
        .sort({ engagementScore: -1 })
        .limit(parseInt(limit))
        .populate('author', 'name profilePicture isVerified')
        .lean();
      
      posts.forEach(post => {
        post.contentType = 'post';
        const tagBonus = post.tags.filter(tag => userInterests.includes(tag)).length * 10;
        post.discoveryScore = post.engagementScore + tagBonus;
      });
      
      content = content.concat(posts);
    }
    
    if (type === 'all' || type === 'reels') {
      const reels = await Reel.find({
        author: { $ne: userId },
        isPublic: true,
        moderationStatus: 'approved'
      })
        .sort({ engagementScore: -1 })
        .limit(parseInt(limit))
        .populate('author', 'name profilePicture isVerified')
        .lean();
      
      reels.forEach(reel => {
        reel.contentType = 'reel';
        const tagBonus = reel.tags.filter(tag => userInterests.includes(tag)).length * 10;
        reel.discoveryScore = reel.engagementScore + tagBonus;
      });
      
      content = content.concat(reels);
    }
    
    // Sort by discovery score
    content.sort((a, b) => b.discoveryScore - a.discoveryScore);
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedContent = content.slice(startIndex, startIndex + parseInt(limit));
    
    res.json({
      success: true,
      data: paginatedContent,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: content.length > startIndex + parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch explore feed',
      error: error.message
    });
  }
};

// Search content
exports.searchContent = async (req, res) => {
  try {
    const { query, type = 'all', page = 1, limit = 20 } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const searchRegex = new RegExp(query, 'i');
    let results = [];
    
    if (type === 'all' || type === 'users') {
      const users = await User.find({
        $or: [
          { name: searchRegex },
          { bio: searchRegex }
        ]
      })
        .select('name profilePicture bio isVerified followersCount')
        .limit(parseInt(limit))
        .lean();
      
      users.forEach(user => {
        user.resultType = 'user';
      });
      
      results = results.concat(users);
    }
    
    if (type === 'all' || type === 'posts') {
      const posts = await Post.find({
        $or: [
          { content: searchRegex },
          { tags: searchRegex }
        ],
        isPublic: true,
        moderationStatus: 'approved'
      })
        .populate('author', 'name profilePicture isVerified')
        .limit(parseInt(limit))
        .lean();
      
      posts.forEach(post => {
        post.resultType = 'post';
      });
      
      results = results.concat(posts);
    }
    
    if (type === 'all' || type === 'tags') {
      // Get trending tags
      const trendingTags = await Post.aggregate([
        {
          $match: {
            isPublic: true,
            moderationStatus: 'approved'
          }
        },
        { $unwind: '$tags' },
        {
          $match: {
            tags: searchRegex
          }
        },
        {
          $group: {
            _id: '$tags',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: parseInt(limit) }
      ]);
      
      trendingTags.forEach(tag => {
        tag.resultType = 'tag';
        tag.tag = tag._id;
      });
      
      results = results.concat(trendingTags);
    }
    
    res.json({
      success: true,
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to search content',
      error: error.message
    });
  }
};

// Get trending tags
exports.getTrendingTags = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const trendingTags = await Post.aggregate([
      {
        $match: {
          isPublic: true,
          moderationStatus: 'approved',
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        }
      },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
          totalEngagement: { $sum: '$engagementScore' }
        }
      },
      { $sort: { totalEngagement: -1, count: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.json({
      success: true,
      data: trendingTags.map(tag => ({
        tag: tag._id,
        postsCount: tag.count,
        engagement: tag.totalEngagement
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending tags',
      error: error.message
    });
  }
};

module.exports = exports;

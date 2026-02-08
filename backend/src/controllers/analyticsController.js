const Post = require('../models/Post');
const Reel = require('../models/Reel');
const Follow = require('../models/Follow');
const User = require('../models/User');

// Get creator analytics
exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { period = '7days' } = req.query;
    
    // Calculate date range
    let startDate;
    switch (period) {
      case '7days':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }
    
    // Get posts analytics
    const postsAnalytics = await Post.aggregate([
      {
        $match: {
          author: userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalLikes: { $sum: '$likesCount' },
          totalComments: { $sum: '$commentsCount' },
          totalShares: { $sum: '$sharesCount' },
          totalViews: { $sum: '$viewsCount' },
          avgEngagement: { $avg: '$engagementScore' }
        }
      }
    ]);
    
    // Get reels analytics
    const reelsAnalytics = await Reel.aggregate([
      {
        $match: {
          author: userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalReels: { $sum: 1 },
          totalLikes: { $sum: '$likesCount' },
          totalComments: { $sum: '$commentsCount' },
          totalShares: { $sum: '$sharesCount' },
          totalViews: { $sum: '$viewsCount' },
          avgEngagement: { $avg: '$engagementScore' }
        }
      }
    ]);
    
    // Get follower growth
    const followerGrowth = await Follow.countDocuments({
      following: userId,
      createdAt: { $gte: startDate }
    });
    
    // Get user stats
    const user = await User.findById(userId).select('followersCount followingCount postsCount');
    
    // Get top posts
    const topPosts = await Post.find({
      author: userId,
      createdAt: { $gte: startDate }
    })
      .sort({ engagementScore: -1 })
      .limit(5)
      .select('content postType likesCount commentsCount sharesCount viewsCount createdAt')
      .lean();
    
    // Get top reels
    const topReels = await Reel.find({
      author: userId,
      createdAt: { $gte: startDate }
    })
      .sort({ engagementScore: -1 })
      .limit(5)
      .select('caption likesCount commentsCount sharesCount viewsCount createdAt')
      .lean();
    
    const analytics = {
      period,
      overview: {
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount: user.postsCount,
        followerGrowth
      },
      posts: postsAnalytics[0] || {
        totalPosts: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalViews: 0,
        avgEngagement: 0
      },
      reels: reelsAnalytics[0] || {
        totalReels: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalViews: 0,
        avgEngagement: 0
      },
      topContent: {
        posts: topPosts,
        reels: topReels
      }
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

// Get post insights
exports.getPostInsights = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if user is the author
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view insights for this post'
      });
    }
    
    const insights = {
      postId: post._id,
      createdAt: post.createdAt,
      metrics: {
        likes: post.likesCount,
        comments: post.commentsCount,
        shares: post.sharesCount,
        views: post.viewsCount,
        engagementScore: post.engagementScore,
        engagementRate: post.viewsCount > 0 ? 
          ((post.likesCount + post.commentsCount + post.sharesCount) / post.viewsCount * 100).toFixed(2) : 
          0
      },
      tags: post.tags,
      isPublic: post.isPublic
    };
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post insights',
      error: error.message
    });
  }
};

// Get reel insights
exports.getReelInsights = async (req, res) => {
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
        message: 'Not authorized to view insights for this reel'
      });
    }
    
    const insights = {
      reelId: reel._id,
      createdAt: reel.createdAt,
      metrics: {
        likes: reel.likesCount,
        comments: reel.commentsCount,
        shares: reel.sharesCount,
        views: reel.viewsCount,
        engagementScore: reel.engagementScore,
        engagementRate: reel.viewsCount > 0 ? 
          ((reel.likesCount + reel.commentsCount + reel.sharesCount) / reel.viewsCount * 100).toFixed(2) : 
          0
      },
      tags: reel.tags,
      duration: reel.duration,
      isPublic: reel.isPublic
    };
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reel insights',
      error: error.message
    });
  }
};

module.exports = exports;

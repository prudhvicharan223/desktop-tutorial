const Post = require('../models/Post');
const User = require('../models/User');
const Follow = require('../models/Follow');

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { content, postType, media, tags, mentions, location, isPublic } = req.body;
    
    const post = new Post({
      author: req.user.userId,
      content,
      postType: postType || 'text',
      media: media || [],
      tags: tags || [],
      mentions: mentions || [],
      location,
      isPublic: isPublic !== undefined ? isPublic : true
    });
    
    await post.save();
    
    // Update user's post count
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { postsCount: 1 }
    });
    
    await post.populate('author', 'name profilePicture isVerified');
    
    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
};

// Get feed with infinite scroll and AI ranking
exports.getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.userId;
    
    // Get user's interests
    const user = await User.findById(userId).select('interests');
    const userInterests = user.interests || [];
    
    // Get users that current user follows
    const following = await Follow.find({ follower: userId }).select('following');
    const followingIds = following.map(f => f.following);
    followingIds.push(userId); // Include own posts
    
    // Get posts from followed users
    const posts = await Post.find({
      author: { $in: followingIds },
      isPublic: true,
      moderationStatus: 'approved'
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'name profilePicture isVerified')
      .lean();
    
    // Calculate ranking scores for AI feed
    posts.forEach(post => {
      const postObj = new Post(post);
      post.rankingScore = postObj.calculateRankingScore(userInterests);
    });
    
    // Sort by ranking score
    posts.sort((a, b) => b.rankingScore - a.rankingScore);
    
    // Check if user has liked each post
    posts.forEach(post => {
      post.isLiked = post.likes.some(like => like.toString() === userId.toString());
    });
    
    res.json({
      success: true,
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: posts.length === parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed',
      error: error.message
    });
  }
};

// Get a single post
exports.getPost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findById(postId)
      .populate('author', 'name profilePicture isVerified followersCount')
      .lean();
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if user has liked the post
    post.isLiked = post.likes.some(like => like.toString() === req.user.userId.toString());
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post',
      error: error.message
    });
  }
};

// Like a post
exports.likePost = async (req, res) => {
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
    
    // Check if already liked
    const alreadyLiked = post.likes.includes(userId);
    
    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      // Like
      post.likes.push(userId);
      post.likesCount += 1;
    }
    
    // Recalculate engagement score
    post.calculateEngagementScore();
    
    await post.save();
    
    res.json({
      success: true,
      data: {
        isLiked: !alreadyLiked,
        likesCount: post.likesCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to like post',
      error: error.message
    });
  }
};

// Share a post
exports.sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { sharesCount: 1 } },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Recalculate engagement score
    post.calculateEngagementScore();
    await post.save();
    
    res.json({
      success: true,
      data: {
        sharesCount: post.sharesCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to share post',
      error: error.message
    });
  }
};

// Update view count
exports.viewPost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { viewsCount: 1 } },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        viewsCount: post.viewsCount
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

// Get user's posts
exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 12 } = req.query;
    
    const posts = await Post.find({
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
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: posts.length === parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user posts',
      error: error.message
    });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
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
        message: 'Not authorized to delete this post'
      });
    }
    
    await Post.findByIdAndDelete(postId);
    
    // Update user's post count
    await User.findByIdAndUpdate(userId, {
      $inc: { postsCount: -1 }
    });
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;
    const { content, tags, location, isPublic } = req.body;
    
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
        message: 'Not authorized to update this post'
      });
    }
    
    // Update fields
    if (content !== undefined) post.content = content;
    if (tags !== undefined) post.tags = tags;
    if (location !== undefined) post.location = location;
    if (isPublic !== undefined) post.isPublic = isPublic;
    
    await post.save();
    await post.populate('author', 'name profilePicture isVerified');
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: error.message
    });
  }
};

module.exports = exports;

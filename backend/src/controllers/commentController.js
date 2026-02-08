const Comment = require('../models/Comment');
const Post = require('../models/Post');

// Create a comment
exports.createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentComment } = req.body;
    const userId = req.user.userId;
    
    const comment = new Comment({
      post: postId,
      author: userId,
      content,
      parentComment: parentComment || null
    });
    
    await comment.save();
    
    // Update post's comment count
    await Post.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 }
    });
    
    // Update parent comment's reply count if it's a reply
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, {
        $inc: { repliesCount: 1 }
      });
    }
    
    // Recalculate post engagement score
    const post = await Post.findById(postId);
    if (post) {
      post.calculateEngagementScore();
      await post.save();
    }
    
    await comment.populate('author', 'name profilePicture isVerified');
    
    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create comment',
      error: error.message
    });
  }
};

// Get comments for a post
exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const comments = await Comment.find({
      post: postId,
      parentComment: null, // Only top-level comments
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'name profilePicture isVerified')
      .lean();
    
    // Check if user has liked each comment
    const userId = req.user.userId;
    comments.forEach(comment => {
      comment.isLiked = comment.likes.some(like => like.toString() === userId.toString());
    });
    
    res.json({
      success: true,
      data: comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: comments.length === parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: error.message
    });
  }
};

// Get replies to a comment
exports.getReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const replies = await Comment.find({
      parentComment: commentId,
      isDeleted: false
    })
      .sort({ createdAt: 1 }) // Oldest first for replies
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'name profilePicture isVerified')
      .lean();
    
    // Check if user has liked each reply
    const userId = req.user.userId;
    replies.forEach(reply => {
      reply.isLiked = reply.likes.some(like => like.toString() === userId.toString());
    });
    
    res.json({
      success: true,
      data: replies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: replies.length === parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch replies',
      error: error.message
    });
  }
};

// Like a comment
exports.likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check if already liked
    const alreadyLiked = comment.likes.includes(userId);
    
    if (alreadyLiked) {
      // Unlike
      comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
      comment.likesCount = Math.max(0, comment.likesCount - 1);
    } else {
      // Like
      comment.likes.push(userId);
      comment.likesCount += 1;
    }
    
    await comment.save();
    
    res.json({
      success: true,
      data: {
        isLiked: !alreadyLiked,
        likesCount: comment.likesCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to like comment',
      error: error.message
    });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check if user is the author
    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }
    
    // Mark as deleted instead of actually deleting
    comment.isDeleted = true;
    comment.content = '[deleted]';
    await comment.save();
    
    // Update post's comment count
    await Post.findByIdAndUpdate(comment.post, {
      $inc: { commentsCount: -1 }
    });
    
    // Update parent comment's reply count if it's a reply
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $inc: { repliesCount: -1 }
      });
    }
    
    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message
    });
  }
};

module.exports = exports;

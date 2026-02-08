const Report = require('../models/Report');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Reel = require('../models/Reel');
const User = require('../models/User');

// Report content
exports.reportContent = async (req, res) => {
  try {
    const { itemType, itemId, reason, description } = req.body;
    const reporterId = req.user.userId;
    
    // Check if already reported by this user
    const existingReport = await Report.findOne({
      reporter: reporterId,
      'reportedItem.itemType': itemType,
      'reportedItem.itemId': itemId
    });
    
    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this content'
      });
    }
    
    // Create report
    const report = new Report({
      reporter: reporterId,
      reportedItem: {
        itemType,
        itemId
      },
      reason,
      description
    });
    
    await report.save();
    
    // Update report count on the content
    let Model;
    switch (itemType) {
      case 'post':
        Model = Post;
        break;
      case 'comment':
        Model = Comment;
        break;
      case 'reel':
        Model = Reel;
        break;
      default:
        break;
    }
    
    if (Model) {
      await Model.findByIdAndUpdate(itemId, {
        $inc: { reportCount: 1 },
        $set: { isReported: true }
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Content reported successfully',
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to report content',
      error: error.message
    });
  }
};

// Get reports (admin/moderator only)
exports.getReports = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    
    const reports = await Report.find({ status })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('reporter', 'name profilePicture')
      .lean();
    
    res.json({
      success: true,
      data: reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: reports.length === parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
};

// Review report (admin/moderator only)
exports.reviewReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action, notes } = req.body;
    const reviewerId = req.user.userId;
    
    const report = await Report.findById(reportId);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    report.status = 'resolved';
    report.action = action;
    report.notes = notes;
    report.reviewedBy = reviewerId;
    report.reviewedAt = new Date();
    
    await report.save();
    
    // Take action on the content based on the decision
    if (action === 'content_removed') {
      const { itemType, itemId } = report.reportedItem;
      
      let Model;
      switch (itemType) {
        case 'post':
          Model = Post;
          break;
        case 'comment':
          Model = Comment;
          break;
        case 'reel':
          Model = Reel;
          break;
        default:
          break;
      }
      
      if (Model) {
        await Model.findByIdAndUpdate(itemId, {
          $set: {
            moderationStatus: 'removed',
            isFlagged: true
          }
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Report reviewed successfully',
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to review report',
      error: error.message
    });
  }
};

module.exports = exports;

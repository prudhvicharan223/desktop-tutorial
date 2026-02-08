const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

// Analytics routes
router.get('/', auth, analyticsController.getAnalytics);
router.get('/posts/:postId', auth, analyticsController.getPostInsights);
router.get('/reels/:reelId', auth, analyticsController.getReelInsights);

module.exports = router;

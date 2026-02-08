const express = require('express');
const router = express.Router();
const exploreController = require('../controllers/exploreController');
const auth = require('../middleware/auth');

// Explore routes
router.get('/', auth, exploreController.getExploreFeed);
router.get('/search', auth, exploreController.searchContent);
router.get('/trending', auth, exploreController.getTrendingTags);

module.exports = router;

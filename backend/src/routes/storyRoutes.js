const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const auth = require('../middleware/auth');

// Story routes
router.post('/', auth, storyController.createStory);
router.get('/', auth, storyController.getStories);
router.get('/:userId', auth, storyController.getUserStories);
router.get('/:storyId/viewers', auth, storyController.getStoryViewers);
router.delete('/:storyId', auth, storyController.deleteStory);

module.exports = router;

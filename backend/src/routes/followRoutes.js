const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const auth = require('../middleware/auth');

// Follow routes
router.post('/:userId/follow', auth, followController.followUser);
router.delete('/:userId/unfollow', auth, followController.unfollowUser);
router.get('/:userId/followers', auth, followController.getFollowers);
router.get('/:userId/following', auth, followController.getFollowing);
router.get('/:userId/check', auth, followController.checkFollowing);

module.exports = router;

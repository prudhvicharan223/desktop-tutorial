const express = require('express');
const router = express.Router();
const reelController = require('../controllers/reelController');
const auth = require('../middleware/auth');

// Reel routes
router.post('/', auth, reelController.createReel);
router.get('/', auth, reelController.getReels);
router.get('/:reelId', auth, reelController.getReel);
router.delete('/:reelId', auth, reelController.deleteReel);
router.post('/:reelId/like', auth, reelController.likeReel);
router.post('/:reelId/share', auth, reelController.shareReel);
router.post('/:reelId/view', auth, reelController.viewReel);
router.get('/user/:userId', auth, reelController.getUserReels);

module.exports = router;

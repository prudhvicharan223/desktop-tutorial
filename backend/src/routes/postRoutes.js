const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

// Post routes
router.post('/', auth, postController.createPost);
router.get('/feed', auth, postController.getFeed);
router.get('/:postId', auth, postController.getPost);
router.put('/:postId', auth, postController.updatePost);
router.delete('/:postId', auth, postController.deletePost);
router.post('/:postId/like', auth, postController.likePost);
router.post('/:postId/share', auth, postController.sharePost);
router.post('/:postId/view', auth, postController.viewPost);
router.get('/user/:userId', auth, postController.getUserPosts);

module.exports = router;

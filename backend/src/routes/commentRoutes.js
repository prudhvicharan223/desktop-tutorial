const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');

// Comment routes
router.post('/:postId/comments', auth, commentController.createComment);
router.get('/:postId/comments', auth, commentController.getComments);
router.get('/comments/:commentId/replies', auth, commentController.getReplies);
router.post('/comments/:commentId/like', auth, commentController.likeComment);
router.delete('/comments/:commentId', auth, commentController.deleteComment);

module.exports = router;

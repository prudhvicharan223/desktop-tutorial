const express = require('express');
const router = express.Router();
const {
  searchUsers,
  getUserById,
  blockUser,
  unblockUser
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect); // All user routes are protected

router.get('/search', searchUsers);
router.get('/:userId', getUserById);
router.post('/block/:userId', blockUser);
router.post('/unblock/:userId', unblockUser);

module.exports = router;

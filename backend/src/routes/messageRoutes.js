const express = require('express');
const router = express.Router();
const {
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect); // All message routes are protected

router.get('/:chatId', getMessages);
router.post('/', sendMessage);
router.put('/read/:chatId', markAsRead);
router.delete('/:messageId', deleteMessage);

module.exports = router;

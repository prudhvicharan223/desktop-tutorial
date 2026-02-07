const express = require('express');
const router = express.Router();
const {
  getChats,
  createChat,
  createGroup,
  getChat,
  updateGroup,
  addParticipants,
  removeParticipant
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.use(protect); // All chat routes are protected

router.get('/', getChats);
router.post('/create', createChat);
router.post('/group', createGroup);
router.get('/:chatId', getChat);
router.put('/group/:chatId', updateGroup);
router.post('/group/:chatId/add-participants', addParticipants);
router.post('/group/:chatId/remove-participant', removeParticipant);

module.exports = router;

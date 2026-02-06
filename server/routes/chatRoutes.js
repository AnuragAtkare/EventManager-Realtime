const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory } = require('../controllers/chatController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/send', authenticate, sendMessage);
router.get('/:eventId/:chatType', authenticate, getChatHistory);

module.exports = router;

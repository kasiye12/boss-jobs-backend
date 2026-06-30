const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.authenticate);

router.get('/conversations', MessageController.getConversations);
router.get('/conversations/:conversationId/messages', MessageController.getMessages);
router.post('/send', MessageController.sendMessage);
router.get('/unread-count', MessageController.getUnreadCount);

module.exports = router;

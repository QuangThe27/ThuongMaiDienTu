const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const ChatController = require('../modules/chat/chat.controller');

router.get('/', authMiddleware, ChatController.getAll);
router.get('/room/:userId/:storeId', authMiddleware, ChatController.getChatRoom);
router.get('/conversations/:storeId', authMiddleware, ChatController.getConversations);

// --- BỔ SUNG ROUTE NÀY ---
router.patch('/read/:userId/:storeId', authMiddleware, ChatController.markAsRead);

module.exports = router;

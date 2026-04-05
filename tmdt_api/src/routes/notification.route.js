const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const NotificationController = require('../modules/notification/notification.controller');

// Lấy thông báo cho User (Khách hàng)
router.get('/user/:userId', authMiddleware, NotificationController.getNotificationsForUser);

// Lấy thông báo cho Store (Cửa hàng)
router.get('/store/:storeId', authMiddleware, NotificationController.getNotificationsForStore);

// Xóa thông báo - Dùng chung theo ID thông báo
router.delete('/:id', authMiddleware, NotificationController.deleteNotification);

router.patch('/:id/read', authMiddleware, NotificationController.markAsRead);

module.exports = router;

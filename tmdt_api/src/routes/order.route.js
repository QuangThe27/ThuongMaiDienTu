const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const OrderController = require('../modules/order/order.controller');

// Lấy tất cả đơn hàng
router.get('/', authMiddleware, OrderController.getAll);

// Lấy đơn hàng theo ID
router.get('/:id', authMiddleware, OrderController.getById);

// Lấy danh sách đơn hàng của một User cụ thể
router.get('/user/:id', authMiddleware, OrderController.getByUserId);

// Tạo đơn hàng mới
router.post('/', authMiddleware, OrderController.create);

// Xóa đơn hàng
router.delete('/:id', authMiddleware, OrderController.remove);

// Cập nhật đơn hàng (Cho admin)
router.put('/:id', authMiddleware, OrderController.update);

// Route mới cho Seller xem chi tiết đơn hàng của họ
router.get('/store/:storeId/:orderId', authMiddleware, OrderController.getForStore);

router.put('/store/:storeId/:orderId/status', authMiddleware, OrderController.updateStatusForStore);

router.get('/analytics/:storeId', authMiddleware, OrderController.getAnalytics);

router.get('/store/:storeId', authMiddleware, OrderController.getOrdersByStore);

module.exports = router;

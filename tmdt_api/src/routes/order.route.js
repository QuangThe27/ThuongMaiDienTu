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

module.exports = router;
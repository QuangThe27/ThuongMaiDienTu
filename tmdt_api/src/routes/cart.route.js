const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const CartController = require('../modules/cart/cart.controller');

// Lấy tất cả giỏ hàng (Admin)
router.get('/', authMiddleware, CartController.getAllCart);

// Lấy giỏ hàng theo User ID
router.get('/user/:user_id', authMiddleware, CartController.getCartByUserId);

// Tạo mới giỏ hàng
router.post('/', authMiddleware, CartController.createCart);

// Cập nhật số lượng
router.put('/:id', authMiddleware, CartController.updateCartQuantity);

// Xóa khỏi giỏ hàng
router.delete('/:id', authMiddleware, CartController.deleteCartById);

module.exports = router;
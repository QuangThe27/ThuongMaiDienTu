const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.route'));
router.use('/users', require('./user.route'));
router.use('/stores', require('./store.route'));
router.use('/categories', require('./category.route'));
router.use('/products', require('./product.route'));
router.use('/carts', require('./cart.route'));
router.use('/orders', require('./order.route'));
router.use('/reviews', require('./review.route'));

module.exports = router;

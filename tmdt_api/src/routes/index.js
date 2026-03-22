const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.route'));
router.use('/users', require('./user.route'));
router.use('/stores', require('./store.route'));
router.use('/categories', require('./category.route'));

module.exports = router;

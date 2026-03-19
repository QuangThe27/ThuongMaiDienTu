const express = require('express');
const router = express.Router();
const AuthController = require('../modules/auth/auth.controller');

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/forgot-password', AuthController.forgotPassword);

module.exports = router;

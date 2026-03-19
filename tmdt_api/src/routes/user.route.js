const express = require('express');
const router = express.Router();
const UserController = require('../modules/user/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const allowRoles = require('../middlewares/role.middleware');
const allowStatus = require('../middlewares/statusAccount.middleware');
const { uploadAvatar } = require('../config/cloudinary');

router.get('/', authMiddleware, allowStatus(['0']), allowRoles(['1']), UserController.getAllUsers);

router.get(
    '/:id',
    authMiddleware,
    allowStatus(['0']),
    allowRoles(['1']),
    UserController.getUserById
);

router.delete(
    '/:id',
    authMiddleware,
    allowStatus(['0']),
    allowRoles(['1']),
    UserController.deleteUserById
);

router.post(
    '/',
    authMiddleware,
    allowStatus(['0']),
    allowRoles(['1']),
    uploadAvatar.single('avatar'),
    UserController.createUser
);

router.put(
    '/:id',
    authMiddleware,
    allowStatus(['0']),
    allowRoles(['1']),
    uploadAvatar.single('avatar'),
    UserController.updateUser
);

module.exports = router;

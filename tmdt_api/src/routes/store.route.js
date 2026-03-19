const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const allowRoles = require('../middlewares/role.middleware');
const allowStatus = require('../middlewares/statusAccount.middleware');
const StoreController = require('../modules/store/store.controller');
const { uploadStore } = require('../config/cloudinary');

router.get('/', authMiddleware, allowStatus(['0']), allowRoles(['1']), StoreController.getAll);
router.get('/:id', authMiddleware, allowStatus(['0']), allowRoles(['1']), StoreController.getById);

// Cấu hình upload đa file: logo và image_sub
const uploadFields = uploadStore.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'image_sub', maxCount: 1 },
]);

router.post(
    '/',
    authMiddleware,
    allowStatus(['0']),
    allowRoles(['1']),
    uploadFields,
    StoreController.create
);
router.put(
    '/:id',
    authMiddleware,
    allowStatus(['0']),
    allowRoles(['1']),
    uploadFields,
    StoreController.update
);
router.delete(
    '/:id',
    authMiddleware,
    allowStatus(['0']),
    allowRoles(['1']),
    StoreController.remove
);

module.exports = router;

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const allowRoles = require('../middlewares/role.middleware');
const allowStatus = require('../middlewares/statusAccount.middleware');
const ProductController = require('../modules/product/product.controller');
const { uploadProduct } = require('../config/cloudinary');

router.get('/best-seller', ProductController.getBestSeller);
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.get('/store/:id', ProductController.getByStore);
router.get('/category/:id', ProductController.getByCategory);
router.post(
    '/',
    authMiddleware,
    uploadProduct.array('images', 10),
    ProductController.createProduct
);
router.put(
    '/:id',
    authMiddleware,
    uploadProduct.array('images', 10),
    ProductController.updateProduct
);
router.delete(
    '/:id',
    authMiddleware,
    allowStatus(['0']),
    allowRoles(['1', '2']),
    ProductController.deleteProduct
);

module.exports = router;

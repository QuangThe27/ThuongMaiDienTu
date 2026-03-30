const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const allowRoles = require('../middlewares/role.middleware');
const ReviewController = require('../modules/review/review.controller');
const { uploadReview } = require('../config/cloudinary'); 

router.post('/', authMiddleware, uploadReview.array('images', 3), ReviewController.create);
router.get('/product/:id', ReviewController.getByProductId);
router.get('/store/:id', authMiddleware,  allowRoles(['2']), ReviewController.getByStore);
router.get('/', authMiddleware,  allowRoles(['1']), ReviewController.getAll);
router.delete('/:id', authMiddleware, allowRoles(['1']), ReviewController.remove);

module.exports = router;
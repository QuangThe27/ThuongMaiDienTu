const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const allowRoles = require('../middlewares/role.middleware');
const allowStatus = require('../middlewares/statusAccount.middleware');
const CategoryController = require('../modules/category/category.controller');

router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.post('/', authMiddleware, allowStatus(['0']), allowRoles(['1']), CategoryController.create);
router.put('/:id', authMiddleware, allowStatus(['0']), allowRoles(['1']), CategoryController.update);
router.delete('/:id', authMiddleware, allowStatus(['0']), allowRoles(['1']), CategoryController.remove);

module.exports = router;

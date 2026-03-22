const CategoryService = require('./category.service');

const getAll = async (req, res) => {
    try {
        const data = await CategoryService.getAllCategories();
        res.json({ data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const data = await CategoryService.getCategoryById(req.params.id);
        res.json({ data });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const create = async (req, res) => {
    try {
        const result = await CategoryService.createCategory(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const update = async (req, res) => {
    try {
        const result = await CategoryService.updateCategoryById(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const remove = async (req, res) => {
    try {
        const result = await CategoryService.deleteCategoryById(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getAll, getById, create, update, remove };
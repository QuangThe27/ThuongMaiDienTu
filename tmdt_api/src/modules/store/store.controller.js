const StoreService = require('./store.service');

const getAll = async (req, res) => {
    try {
        const data = await StoreService.getAllStores();
        res.json({ data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const data = await StoreService.getStoreById(req.params.id);
        res.json({ data });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const create = async (req, res) => {
    try {
        const result = await StoreService.createStore(req.body, req.files);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const update = async (req, res) => {
    try {
        const result = await StoreService.updateStoreById(req.params.id, req.body, req.files);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const remove = async (req, res) => {
    try {
        const result = await StoreService.deleteStoreById(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getAll, getById, create, update, remove };

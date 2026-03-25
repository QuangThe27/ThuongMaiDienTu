const CartService = require('./cart.service');

const getAllCart = async (req, res) => {
    try {
        const carts = await CartService.getAllCarts();
        res.status(200).json({ success: true, data: carts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCartByUserId = async (req, res) => {
    try {
        const { user_id } = req.params;
        const carts = await CartService.getCartByUserId(user_id);
        res.status(200).json({ success: true, data: carts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createCart = async (req, res) => {
    try {
        const result = await CartService.createCart(req.body);
        res.status(201).json({ success: true, ...result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateCartQuantity = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const result = await CartService.updateCartQuantity(id, quantity);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteCartById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await CartService.deleteCartById(id);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { 
    getAllCart, 
    getCartByUserId, 
    createCart, 
    updateCartQuantity, 
    deleteCartById 
};
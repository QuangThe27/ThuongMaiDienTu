const OrderService = require('./order.service');

const getAll = async (req, res) => {
    try {
        const data = await OrderService.getAllOrders();
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const data = await OrderService.getOrderById(req.params.id);
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(404).json({ status: 'error', message: error.message });
    }
};

const getByUserId = async (req, res) => {
    try {
        const data = await OrderService.getOrdersByUserId(req.params.id);
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const create = async (req, res) => {
    try {
        const { items, ...orderData } = req.body;
        // orderData bao gồm: user_id, name, address, phone, total_price, payment_method...
        const orderId = await OrderService.createOrder(orderData, items);
        res.status(201).json({ 
            status: 'success', 
            message: 'Đặt hàng thành công!', 
            orderId 
        });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

const remove = async (req, res) => {
    try {
        await OrderService.deleteOrder(req.params.id);
        res.status(200).json({ status: 'success', message: 'Xóa đơn hàng thành công.' });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

module.exports = { getAll, getById, getByUserId, create, remove };
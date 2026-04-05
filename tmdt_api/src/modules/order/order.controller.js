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

        /**
         * orderData yêu cầu tối thiểu:
         * user_id, name, address, phone, total_price, payment_method
         */
        const orderId = await OrderService.createOrder(orderData, items);

        return res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công!',
            orderId: orderId,
        });
    } catch (error) {
        console.error('Controller Order Error:', error.message);
        return res.status(400).json({
            success: false,
            message: error.message,
        });
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

const getForStore = async (req, res) => {
    try {
        const { orderId, storeId } = req.params;
        const data = await OrderService.getOrderStoreById(orderId, storeId);
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(404).json({ status: 'error', message: error.message });
    }
};

const updateStatusForStore = async (req, res) => {
    try {
        const { orderId, storeId } = req.params;
        const { status } = req.body;
        await OrderService.updateStoreOrderStatus(orderId, storeId, status);
        res.status(200).json({ status: 'success', message: 'Cập nhật trạng thái thành công.' });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

const getAnalytics = async (req, res) => {
    try {
        const { storeId } = req.params;
        const data = await OrderService.getStoreAnalytics(storeId);
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = {
    getAll,
    getById,
    getByUserId,
    create,
    remove,
    getForStore,
    updateStatusForStore,
    getAnalytics,
};

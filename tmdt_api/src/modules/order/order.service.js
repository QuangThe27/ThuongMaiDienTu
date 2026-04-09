const OrderModel = require('./order.model');

const getAllOrders = async () => await OrderModel.findAll();

const getOrderById = async (id) => {
    const order = await OrderModel.findById(id);
    if (!order) throw new Error('Không tìm thấy đơn hàng.');
    return order;
};

const getOrdersByUserId = async (userId) => await OrderModel.findByUserId(userId);

const createOrder = async (orderData, items) => {
    if (!items || items.length === 0) throw new Error('Đơn hàng phải có ít nhất một sản phẩm.');
    return await OrderModel.create(orderData, items);
};

const deleteOrder = async (id) => {
    const success = await OrderModel.deleteById(id);
    if (!success) throw new Error('Xóa đơn hàng thất bại hoặc đơn hàng không tồn tại.');
    return success;
};

const getOrderStoreById = async (orderId, storeId) => {
    const order = await OrderModel.findByStoreId(orderId, storeId);
    if (!order || order.items.length === 0) {
        throw new Error('Không tìm thấy sản phẩm thuộc cửa hàng này trong đơn hàng.');
    }
    return order;
};

const updateStoreOrderStatus = async (orderId, storeId, status) => {
    return await OrderModel.updateItemStatus(orderId, storeId, status);
};

const updateOrder = async (id, updateData) => {
    // Kiểm tra xem đơn hàng có tồn tại không trước khi cập nhật
    const order = await OrderModel.findById(id);
    if (!order) throw new Error('Không tìm thấy đơn hàng để cập nhật.');

    const success = await OrderModel.update(id, updateData);
    if (!success) throw new Error('Cập nhật đơn hàng thất bại.');

    return success;
};

const getStoreAnalytics = async (storeId) => {
    const overview = await OrderModel.getRevenueByStore(storeId);
    const products = await OrderModel.getProductRevenue(storeId);
    return { overview, products };
};

const getOrdersByStore = async (storeId) => {
    return await OrderModel.getOrdersByStore(storeId);
};

module.exports = {
    getAllOrders,
    getOrderById,
    getOrdersByUserId,
    createOrder,
    deleteOrder,
    getOrderStoreById,
    getOrdersByStore,
    updateStoreOrderStatus,
    updateOrder,
    getStoreAnalytics,
};

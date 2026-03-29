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

module.exports = { getAllOrders, getOrderById, getOrdersByUserId, createOrder, deleteOrder };
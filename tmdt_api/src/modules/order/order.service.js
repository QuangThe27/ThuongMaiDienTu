const OrderModel = require('./order.model');
const { db } = require('../../config/database');

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

const deleteOrder = async (orderId) => {
    // Sử dụng connection từ pool để chạy Transaction
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Lấy danh sách sản phẩm (items) của đơn hàng để biết số lượng cần hoàn trả
        const [items] = await connection.query(
            'SELECT variant_id, quantity FROM order_items WHERE order_id = ?',
            [orderId]
        );

        // 2. Cộng lại số lượng vào kho (product_variants)
        for (const item of items) {
            if (item.variant_id) {
                await connection.query(
                    'UPDATE product_variants SET quantity = quantity + ? WHERE id = ?',
                    [item.quantity, item.variant_id]
                );
            }
        }

        // 3. Xóa đơn hàng
        // (Do có ON DELETE CASCADE nên order_items sẽ tự động bị xóa theo)
        const [result] = await connection.query('DELETE FROM orders WHERE id = ?', [orderId]);

        if (result.affectedRows === 0) {
            throw new Error('Đơn hàng không tồn tại.');
        }

        // Hoàn tất mọi thay đổi
        await connection.commit();
        return true;
    } catch (error) {
        // Nếu có bất kỳ lỗi nào, hủy bỏ toàn bộ thay đổi
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
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

const { db } = require('../../config/database');
const NotificationModel = require('../notification/notification.model');

const findAll = async () => {
    const [rows] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    return rows;
};

const findById = async (id) => {
    // Lấy thông tin đơn hàng
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) return null;

    const order = orders[0];

    // Lấy danh sách items của đơn hàng đó
    const [items] = await db.query(
        `
        SELECT oi.*, p.name as product_name, pv.variant_name, pv.variant_value 
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN product_variants pv ON oi.variant_id = pv.id
        WHERE oi.order_id = ?
    `,
        [id]
    );

    order.items = items;
    return order;
};

const findByUserId = async (userId) => {
    const [rows] = await db.query(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
    );
    return rows;
};

const create = async (orderData, items) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Tạo đơn hàng chính
        const [orderResult] = await connection.query('INSERT INTO orders SET ?', [orderData]);
        const orderId = orderResult.insertId;

        // 2. Duyệt qua từng item để kiểm tra kho và trừ số lượng
        for (const item of items) {
            // Kiểm tra số lượng tồn kho (FOR UPDATE để lock dòng dữ liệu tránh tranh chấp)
            const [variants] = await connection.query(
                'SELECT quantity FROM product_variants WHERE id = ? FOR UPDATE',
                [item.variant_id]
            );

            if (variants.length === 0 || variants[0].quantity < item.quantity) {
                throw new Error(
                    `Sản phẩm với biến thể ID ${item.variant_id} không đủ hàng trong kho.`
                );
            }

            // Trừ số lượng kho
            await connection.query(
                'UPDATE product_variants SET quantity = quantity - ? WHERE id = ?',
                [item.quantity, item.variant_id]
            );

            // Lưu vào order_items
            const itemData = {
                order_id: orderId,
                product_id: item.product_id,
                variant_id: item.variant_id,
                price: item.price,
                quantity: item.quantity,
            };
            await connection.query('INSERT INTO order_items SET ?', [itemData]);
        }

        // 3. Xóa giỏ hàng của user sau khi đặt hàng thành công
        await connection.query('DELETE FROM carts WHERE user_id = ?', [orderData.user_id]);

        // 4. TẠO THÔNG BÁO CHO USER
        // Truyền connection vào để đảm bảo thông báo nằm trong transaction chung
        await NotificationModel.createNotification(
            {
                is_user_store: 0, // 0 là gửi cho user
                user_id: orderData.user_id,
                title: 'Đặt hàng thành công',
                message: `Đơn hàng #${orderId} của bạn đã được hệ thống ghi nhận và đang chờ xử lý.`,
                path: `/thong-tin-don-hang/${orderId}`,
                status: 0,
            },
            connection
        );

        await connection.commit();
        return orderId;
    } catch (error) {
        await connection.rollback();
        console.error('Error in order creation transaction:', error.message);
        throw error;
    } finally {
        connection.release();
    }
};

const deleteById = async (id) => {
    const [result] = await db.query('DELETE FROM orders WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

const findByStoreId = async (orderId, storeId) => {
    // 1. Lấy thông tin chung của đơn hàng
    const [orders] = await db.query(
        'SELECT id, name, address, positioning, phone, total_price, status, created_at FROM orders WHERE id = ?',
        [orderId]
    );

    if (orders.length === 0) return null;
    const order = orders[0];

    // 2. Lấy các items thuộc store này trong đơn hàng đó
    const [items] = await db.query(
        `
        SELECT 
            oi.*, 
            p.name as product_name, 
            pv.variant_name, 
            pv.variant_value,
            p.store_id
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        LEFT JOIN product_variants pv ON oi.variant_id = pv.id
        WHERE oi.order_id = ? AND p.store_id = ?
    `,
        [orderId, storeId]
    );

    order.items = items;
    return order;
};

const updateItemStatus = async (orderId, storeId, status) => {
    const [result] = await db.query(
        `
        UPDATE order_items oi
        JOIN products p ON oi.product_id = p.id
        SET oi.status = ?
        WHERE oi.order_id = ? AND p.store_id = ?
    `,
        [status, orderId, storeId]
    );
    return result.affectedRows > 0;
};

const update = async (id, updateData) => {
    // updateData sẽ là một object ví dụ: { status: 1, payment_status: 1 }
    const [result] = await db.query('UPDATE orders SET ? WHERE id = ?', [updateData, id]);
    return result.affectedRows > 0;
};

// Tính toán doanh thu theo từng trạng thái của 1 Store
const getRevenueByStore = async (storeId) => {
    const [rows] = await db.query(
        `
        SELECT 
            oi.status,
            COUNT(oi.id) as total_orders,
            SUM(oi.price * oi.quantity) as total_revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE p.store_id = ?
        GROUP BY oi.status
    `,
        [storeId]
    );
    return rows;
};

// Lấy danh sách doanh thu chi tiết từng sản phẩm
const getProductRevenue = async (storeId) => {
    const [rows] = await db.query(
        `
        SELECT 
            p.id, p.name,
            SUM(oi.quantity) as total_sold,
            SUM(oi.price * oi.quantity) as total_revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE p.store_id = ? AND oi.status = 2 -- Chỉ tính các đơn đã Hoàn thành
        GROUP BY p.id
        ORDER BY total_revenue DESC
    `,
        [storeId]
    );
    return rows;
};

// Lấy danh sách đơn hàng online chưa thanh toán
const findPendingOnlineOrders = async () => {
    const [rows] = await db.query(
        'SELECT * FROM orders WHERE payment_method = 1 AND payment_status = 0'
    );
    return rows;
};

// Cập nhật trạng thái thanh toán thành công
const updatePaymentStatus = async (orderId, connection = null) => {
    const query = 'UPDATE orders SET payment_status = 1 WHERE id = ?';
    if (connection) {
        return await connection.query(query, [orderId]);
    }
    return await db.query(query, [orderId]);
};

const getOrdersByStore = async (storeId) => {
    const query = `
        SELECT DISTINCT o.* FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE p.store_id = ?
        ORDER BY o.created_at DESC
    `;
    const [rows] = await db.query(query, [storeId]);
    return rows;
};

module.exports = {
    findAll,
    findById,
    findByUserId,
    create,
    deleteById,
    findByStoreId,
    updateItemStatus,
    update,
    getRevenueByStore,
    getProductRevenue,
    getOrdersByStore,
    findPendingOnlineOrders,
    updatePaymentStatus,
};

const { db } = require('../../config/database');

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
    const [items] = await db.query(`
        SELECT oi.*, p.name as product_name, pv.variant_name, pv.variant_value 
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN product_variants pv ON oi.variant_id = pv.id
        WHERE oi.order_id = ?
    `, [id]);

    order.items = items;
    return order;
};

const findByUserId = async (userId) => {
    const [rows] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
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
            // Kiểm tra số lượng tồn kho
            const [variants] = await connection.query(
                'SELECT quantity FROM product_variants WHERE id = ? FOR UPDATE', 
                [item.variant_id]
            );

            if (variants.length === 0 || variants[0].quantity < item.quantity) {
                throw new Error(`Sản phẩm với variant_id ${item.variant_id} không đủ hàng.`);
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
                quantity: item.quantity
            };
            await connection.query('INSERT INTO order_items SET ?', [itemData]);
        }

        // 3. XÓA GIỎ HÀNG CỦA USER SAU KHI ĐẶT HÀNG THÀNH CÔNG
        await connection.query('DELETE FROM carts WHERE user_id = ?', [orderData.user_id]);

        await connection.commit();
        return orderId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const deleteById = async (id) => {
    const [result] = await db.query('DELETE FROM orders WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

module.exports = { findAll, findById, findByUserId, create, deleteById };
const { db } = require('../../config/database');

// Lấy tất cả tin nhắn (Dùng cho Admin hoặc thống kê)
const findAll = async () => {
    const [rows] = await db.execute('SELECT * FROM messages ORDER BY created_at DESC');
    return rows;
};

// Lưu tin nhắn mới
const create = async (data) => {
    const { user_id, store_id, sender_type, message } = data;
    const query = `INSERT INTO messages (user_id, store_id, sender_type, message) VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(query, [user_id, store_id, sender_type, message]);
    return result.insertId;
};

// Lấy lịch sử chat giữa 1 User và 1 Store
const findChatRoom = async (userId, storeId) => {
    const query = `
        SELECT * FROM messages 
        WHERE user_id = ? AND store_id = ? 
        ORDER BY created_at ASC
    `;
    const [rows] = await db.execute(query, [userId, storeId]);
    return rows;
};

const findConversationsByStore = async (storeId) => {
    const query = `
        SELECT 
            u.id as user_id, 
            u.name as user_name, 
            u.avatar as user_avatar,
            m.message as last_message,
            m.created_at as last_time
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE m.store_id = ?
        AND m.id IN (
            SELECT MAX(id) FROM messages WHERE store_id = ? GROUP BY user_id
        )
        ORDER BY m.created_at DESC
    `;
    const [rows] = await db.execute(query, [storeId, storeId]);
    return rows;
};

module.exports = { findAll, create, findChatRoom, findConversationsByStore };
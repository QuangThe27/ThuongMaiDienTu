const { db } = require('../../config/database');

const findAll = async () => {
    const [rows] = await db.execute('SELECT * FROM messages ORDER BY created_at DESC');
    return rows;
};

const create = async (data) => {
    const { user_id, store_id, sender_type, message } = data;
    const query = `INSERT INTO messages (user_id, store_id, sender_type, message, is_read) VALUES (?, ?, ?, ?, 0)`;
    const [result] = await db.execute(query, [user_id, store_id, sender_type, message]);
    return result.insertId;
};

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
            m.created_at as last_time,
            m.is_read,
            m.sender_type
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

const markAsRead = async (userId, storeId) => {
    // Cập nhật tất cả tin nhắn do User (sender_type = 1) gửi mà Store chưa đọc
    const query = `
        UPDATE messages 
        SET is_read = 1 
        WHERE user_id = ? AND store_id = ? AND sender_type = 1 AND is_read = 0
    `;
    const [result] = await db.execute(query, [userId, storeId]);
    return result;
};

module.exports = { findAll, create, findChatRoom, findConversationsByStore, markAsRead };

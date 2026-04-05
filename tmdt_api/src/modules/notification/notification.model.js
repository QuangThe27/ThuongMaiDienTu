const { db } = require('../../config/database');
const { getIO } = require('../../config/socket');

const getNotifications = async (targetId, isStore = 0) => {
    const column = isStore === 1 ? 'store_id' : 'user_id';
    const sql = `
        SELECT id, is_user_store, user_id, store_id, title, message, status, path, created_at 
        FROM notifications 
        WHERE ${column} = ? AND is_user_store = ?
        ORDER BY created_at DESC
    `;

    try {
        const [rows] = await db.query(sql, [targetId, isStore]);
        return rows;
    } catch (error) {
        console.error('Error in getNotifications:', error.message);
        throw error;
    }
};

const createNotification = async (data, connection = db) => {
    const notifications = Array.isArray(data) ? data : [data];
    if (notifications.length === 0) return null;

    const values = notifications.map((noti) => [
        noti.is_user_store ?? 0,
        noti.user_id ?? null,
        noti.store_id ?? null,
        noti.title,
        noti.message,
        noti.status ?? 0,
        noti.path ?? null,
    ]);

    const sql = `
        INSERT INTO notifications (is_user_store, user_id, store_id, title, message, status, path) 
        VALUES ?
    `;

    const [result] = await connection.query(sql, [values]);

    // Lấy ID đầu tiên của bản ghi vừa chèn (nếu chèn nhiều thì ID sẽ tự tăng liên tiếp)
    let firstId = result.insertId;

    // Gửi thông báo qua Socket.io
    const io = getIO();
    notifications.forEach((noti, index) => {
        const room = noti.is_user_store === 1 ? `store_${noti.store_id}` : `user_${noti.user_id}`;

        // Đổi tên sự kiện thành 'new_notification' cho khớp với Header.jsx
        // Gửi đầy đủ object bao gồm ID để Frontend xử lý được ngay
        io.to(room).emit('new_notification', {
            id: firstId + index, // Gán ID thực tế từ DB
            title: noti.title,
            message: noti.message,
            path: noti.path,
            status: noti.status ?? 0,
            is_user_store: noti.is_user_store,
            created_at: new Date(),
        });
    });

    return result;
};

const deleteNotificationById = async (id) => {
    const sql = `DELETE FROM notifications WHERE id = ?`;
    const [result] = await db.query(sql, [id]);
    return result;
};

const updateStatus = async (id) => {
    const sql = `UPDATE notifications SET status = 1 WHERE id = ?`;
    try {
        const [result] = await db.query(sql, [id]);

        if (result.affectedRows > 0) {
            // Lấy thông tin bản ghi vừa update để gửi socket (tùy chọn)
            const [rows] = await db.query('SELECT * FROM notifications WHERE id = ?', [id]);
            const updatedNoti = rows[0];

            const io = getIO();
            const room =
                updatedNoti.is_user_store === 1
                    ? `store_${updatedNoti.store_id}`
                    : `user_${updatedNoti.user_id}`;

            // Gửi sự kiện 'notification_read' để Frontend cập nhật UI
            io.to(room).emit('notification_read', { id: updatedNoti.id });
        }

        return result;
    } catch (error) {
        console.error('Error in updateStatus:', error.message);
        throw error;
    }
};

module.exports = {
    createNotification,
    getNotifications,
    deleteNotificationById,
    updateStatus,
};

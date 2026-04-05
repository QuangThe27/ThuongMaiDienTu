const NotificationService = require('./notification.service');

// Lấy thông báo của User
const getNotificationsForUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const notifications = await NotificationService.getNotificationsForUser(userId);
        return res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy thông báo của Store
const getNotificationsForStore = async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const notifications = await NotificationService.getNotificationsForStore(storeId);
        return res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await NotificationService.deleteNotification(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        return res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await NotificationService.markAsRead(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        return res.status(200).json({ success: true, message: 'Marked as read' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getNotificationsForUser,
    getNotificationsForStore,
    deleteNotification,
    markAsRead,
};

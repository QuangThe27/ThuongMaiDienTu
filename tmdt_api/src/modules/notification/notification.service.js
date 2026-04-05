const NotificationModel = require('./notification.model');

const getNotificationsForUser = async (userId) => {
    return await NotificationModel.getNotifications(userId, 0);
};

const getNotificationsForStore = async (storeId) => {
    return await NotificationModel.getNotifications(storeId, 1);
};

const deleteNotification = async (id) => {
    return await NotificationModel.deleteNotificationById(id);
};

const markAsRead = async (id) => {
    return await NotificationModel.updateStatus(id);
};

module.exports = {
    getNotificationsForUser,
    getNotificationsForStore,
    deleteNotification,
    markAsRead,
};

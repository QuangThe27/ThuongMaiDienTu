import apiClient from '../api/axiosInstance';

export const getNotificationsForUser = async (userId) => {
    const response = await apiClient.get(`/notification/user/${userId}`);
    return response.data;
};

export const getNotificationsForStore = async (storeId) => {
    const response = await apiClient.get(`/notification/store/${storeId}`);
    return response.data;
};

export const deleteNotification = async (id) => {
    const response = await apiClient.delete(`/notification/${id}`);
    return response.data;
};

export const markAsRead = async (id) => {
    const response = await apiClient.patch(`/notification/${id}/read`);
    return response.data;
};

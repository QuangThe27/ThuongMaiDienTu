import apiClient from '../api/axiosInstance';

export const getAll = async () => {
    const response = await apiClient.get('/chats');
    return response.data;
};

export const getChatRoom = async (userId, storeId) => {
    const response = await apiClient.get(`/chats/room/${userId}/${storeId}`);
    return response.data;
};

export const getConversations = async (storeId) => {
    const response = await apiClient.get(`/chats/conversations/${storeId}`);
    return response.data;
};

// --- BỔ SUNG FUNCTION NÀY ---
export const markAsRead = async (userId, storeId) => {
    const response = await apiClient.patch(`/chats/read/${userId}/${storeId}`);
    return response.data;
};

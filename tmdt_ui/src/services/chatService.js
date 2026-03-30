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
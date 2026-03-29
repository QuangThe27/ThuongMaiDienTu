import apiClient from '../api/axiosInstance';

export const getOrders = async () => {
    const response = await apiClient.get('/orders');
    return response.data;
};

export const getOrderById = async (id) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
};

export const getOrderByUserId = async (id) => {
    const response = await apiClient.get(`/orders/user/${id}`);
    return response.data;
};

export const createOrder = async (data) => {
    const response = await apiClient.post('/orders', data);
    return response.data;
};

export const deleteOrder = async (id) => {
    const response = await apiClient.delete(`/orders/${id}`);
    return response.data;
};
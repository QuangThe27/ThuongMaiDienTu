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

export const getOrderStoreById = async (storeId, orderId) => {
    const response = await apiClient.get(`/orders/store/${storeId}/${orderId}`);
    return response.data;
};

export const updateStoreOrderStatus = async (storeId, orderId, status) => {
    const response = await apiClient.put(`/orders/store/${storeId}/${orderId}/status`, { status });
    return response.data;
};

export const getStoreAnalytics = async (storeId) => {
    const response = await apiClient.get(`/orders/analytics/${storeId}`);
    return response.data;
};

export const updateOrder = async (id, data) => {
    const response = await apiClient.put(`/orders/${id}`, data);
    return response.data;
};

export const getOrdersByStore = async (storeId) => {
    const response = await apiClient.get(`/orders/store/${storeId}`);
    return response.data;
};

import apiClient from '../api/axiosInstance';

export const getCarts = async () => {
    const response = await apiClient.get('/carts');
    return response.data;
};

export const getCartByUserId = async (id) => {
    const response = await apiClient.get(`/carts/user/${id}`);
    return response.data;
};

export const createCart = async (data) => {
    const response = await apiClient.post('/carts', data);
    return response.data;
};

export const updateCartQuantity = async (id, quantity) => {
    const response = await apiClient.put(`/carts/${id}`, { quantity });
    return response.data;
};

export const deleteCart = async (id) => {
    const response = await apiClient.delete(`/carts/${id}`);
    return response.data;
};
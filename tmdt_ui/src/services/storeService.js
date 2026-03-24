import apiClient from '../api/axiosInstance';

export const getStores = async () => {
    const response = await apiClient.get('/stores');
    return response.data;
};

export const getStoreById = async (id) => {
    const response = await apiClient.get(`/stores/${id}`);
    return response.data;
};

export const getStoreByUserId = async (userId) => {
    const response = await apiClient.get(`/stores/user/${userId}`);
    return response.data;
};

export const createStore = async (formData) => {
    const response = await apiClient.post('/stores', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const updateStore = async (id, formData) => {
    const response = await apiClient.put(`/stores/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const deleteStore = async (id) => {
    const response = await apiClient.delete(`/stores/${id}`);
    return response.data;
};
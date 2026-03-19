import apiClient from '../api/axiosInstance';

export const getUsers = async () => {
    const response = await apiClient.get('/users');
    return response.data;
};

export const getUserById = async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
};

export const createUser = async (formData) => {
    const response = await apiClient.post('/users', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const updateUser = async (id, formData) => {
    const response = await apiClient.put(`/users/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};
export const deleteUser = async (id) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
};
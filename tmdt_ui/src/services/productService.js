import apiClient, { publicClient } from '../api/axiosInstance';

export const getProducts = async () => {
    const response = await publicClient.get('/products');
    return response.data;
};

export const getProductById = async (id) => {
    const response = await publicClient.get(`/products/${id}`);
    return response.data;
};

export const getProductsByStore = async (storeId) => {
    const response = await apiClient.get(`/products/store/${storeId}`); 
    return response.data;
};

export const createProduct = async (formData) => {
    const response = await apiClient.post('/products', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updateProduct = async (id, formData) => {
    const response = await apiClient.put(`/products/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
};

export const getProductsByCategory = async (categoryId) => {
    const response = await publicClient.get(`/products/category/${categoryId}`);
    return response.data;
};
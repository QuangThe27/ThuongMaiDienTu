import apiClient, { publicClient } from '../api/axiosInstance';

export const createReview = async (formData) => {
    const response = await apiClient.post('/reviews', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getReviews = async () => {
    const response = await apiClient.get('/reviews');
    return response.data;
};

export const deleteReview = async (id) => {
    const response = await apiClient.delete(`/reviews/${id}`);
    return response.data;
};

export const getReviewsByProductId = async (productId) => {
    const response = await publicClient.get(`/reviews/product/${productId}`);
    return response.data;
};

export const getReviewsByStore = async (storeId) => {
    const response = await apiClient.get(`/reviews/store/${storeId}`);
    return response.data;
};
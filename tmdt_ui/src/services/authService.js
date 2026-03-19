import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const loginApi = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Đã có lỗi xảy ra' };
    }
};

export const registerApi = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Đăng ký thất bại' };
    }
};

export const forgotPasswordApi = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/auth/forgot-password`, {
            email,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Đã có lỗi xảy ra' };
    }
};

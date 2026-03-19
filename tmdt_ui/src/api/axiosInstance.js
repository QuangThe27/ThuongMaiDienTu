import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.yourdomain.com';

// 1. Client dành cho API công khai (không cần Token)
export const publicClient = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// 2. Client dành cho API cần bảo mật (có Interceptor đính kèm Token)
const apiClient = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Interceptor cho Request: Luôn lấy token mới nhất từ LocalStorage
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;
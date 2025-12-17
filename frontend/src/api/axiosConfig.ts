// Dosya Yolu: src/api/axiosConfig.ts
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Backend adresi
    headers: {
        'Content-Type': 'application/json',
    },
});

// İSTEK INTERCEPTOR: Token ekleme
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
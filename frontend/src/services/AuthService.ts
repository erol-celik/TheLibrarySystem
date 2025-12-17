// Dosya Yolu: src/services/AuthService.ts
import api from '../api/axiosConfig';

export const AuthService = {
    // LOGIN
    login: async (credentials: any) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            // Backend'den gelen user objesini sakla
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // REGISTER
    register: async (userData: any) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // LOGOUT
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login'; // Login'e yönlendir
    }
};
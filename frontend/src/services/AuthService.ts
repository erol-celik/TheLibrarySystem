// Dosya Yolu: src/services/AuthService.ts
import api from '../api/axiosConfig';

export const AuthService = {
    // LOGIN - Now supports role-specific endpoints
    login: async (credentials: any, role: 'user' | 'librarian' | 'admin' = 'user') => {
        const endpoint = `/auth/login/${role}`;
        const response = await api.post(endpoint, credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            // Store user object from backend
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // REGISTER
    register: async (userData: any) => {
        const response = await api.post('/auth/register', userData);

        // Eğer backend başarılı kayıt sonrası otomatik token dönüyorsa (AuthResponse.java gibi)
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response.data;
    },

    // LOGOUT
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login'; // Login'e yönlendir
    }
};
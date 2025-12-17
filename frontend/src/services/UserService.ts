import api from '../api/axiosConfig';
import { UserAccount } from '../types';

export const UserService = {
    // Profilimi Getir (Token ile)
    getMe: async (): Promise<UserAccount> => {
        const response = await api.get('/users/me'); // Backend'de bu ucu yazmıştık
        const data = response.data;
        
        return {
            id: String(data.id),
            username: data.name,
            email: data.email,
            role: data.role ? data.role.replace('ROLE_', '').toLowerCase() : 'user',
            status: data.isBanned ? 'blocked' : 'active',
            walletBalance: data.balance || 0,
            penaltyCount: data.penaltyScore || 0,
            phone: data.phone || '',
            address: data.address || '',
            profilePicture: '',
            badge: 'Member',
            createdDate: new Date().toISOString()
        };
    }
};
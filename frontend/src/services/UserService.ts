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
            role: data.role ? data.role.replace('ROLE_', '').toLowerCase() : (data.roles && data.roles.length > 0)
                ? data.roles[0].replace('ROLE_', '').toLowerCase()
                : 'user',
            status: data.isBanned ? 'blocked' : 'active',
            walletBalance: data.walletBalance || 0,
            penaltyCount: 0, // Backend DTO'da penaltyScore/penaltyCount yok, geçici olarak 0
            phone: data.phone || '', // Backend'de tanımlı
            address: data.address || '',
            profilePicture: data.avatarUrl || '',
            bio: data.bio || '',
            badge: 'Member',
            createdDate: new Date().toISOString()
        };
    },
    // Profil Güncelle
    updateProfile: async (data: Partial<UserAccount>): Promise<UserAccount> => {
        // Backend DTO: name, bio, phoneNumber, address, profilePictureUrl
        const payload = {
            name: data.username, // Field mapping: username (frontend) -> name (backend)
            bio: data.bio,
            phoneNumber: data.phone,
            address: data.address,
            // profilePictureUrl: data.profilePicture // Şimdilik resim yok
        };
        const response = await api.put('/users/me', payload);

        // Response'u UserAccount tipine çevirebiliriz veya mevcut getMe mapping mantığını kullanabiliriz
        const resData = response.data;
        return {
            id: String(resData.id),
            username: resData.name,
            email: resData.email,
            role: resData.role ? resData.role.replace('ROLE_', '').toLowerCase() : 'user', // Same logic as getMe
            status: resData.isBanned ? 'blocked' : 'active',
            walletBalance: resData.walletBalance || 0,
            penaltyCount: 0,
            phone: resData.phone || '',
            address: resData.address || '',
            profilePicture: resData.avatarUrl || '',
            bio: resData.bio || '',
            badge: 'Member',
            createdDate: new Date().toISOString()
        };
    }
};
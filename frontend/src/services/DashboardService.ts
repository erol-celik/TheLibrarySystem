import api from '../api/axiosConfig';

export const DashboardService = {
    // Genel istatistikleri getir (Üye sayısı, kitap sayısı vb.)
    getPublicStats: async () => {
        const response = await api.get('/dashboard/public');
        return response.data;
    },
    // Admin istatistiklerini getir (Ödünç alınan kitaplar vb.)
    getAdminStats: async () => {
        const response = await api.get('/dashboard/admin');
        return response.data;
    }
};

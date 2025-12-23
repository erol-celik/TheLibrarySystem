import api from '../api/axiosConfig';

export interface HomepageStats {
    totalBooks: number;
    totalDigitalBooks: number;
    categoryDistribution: Record<string, number>;
    totalUsers: number;
    activeRentals: number;
}

export const DashboardService = {
    // Genel istatistikleri getir (Üye sayısı, kitap sayısı vb.)
    getPublicStats: async (): Promise<HomepageStats> => {
        const response = await api.get<HomepageStats>('/dashboard/public');
        return response.data;
    },
    // Admin istatistiklerini getir (Ödünç alınan kitaplar vb.)
    getAdminStats: async () => {
        const response = await api.get('/dashboard/admin');
        return response.data;
    }
};

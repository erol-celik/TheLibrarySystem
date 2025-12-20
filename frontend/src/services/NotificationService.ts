import api from '../api/axiosConfig';

export interface NotificationItem {
    id: string;
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    date: string;
    read: boolean;
    targetRole?: 'user' | 'librarian' | 'admin' | 'all';
    targetUser?: string;
}

export const NotificationService = {
    // Tüm bildirimleri getir
    getAllNotifications: async (): Promise<NotificationItem[]> => {
        const response = await api.get('/notifications');

        // Backend verisini Frontend formatına çeviriyoruz
        return response.data.map((item: any) => ({
            id: String(item.id),
            type: 'info', // Backend'den gelmediği için varsayılan
            title: 'Bildirim',
            message: item.message,
            date: new Date(item.createdDate).toLocaleString(), // Tarih formatı
            read: item.read // Backend'de 'isRead' veya 'read' olabilir, kontrol ettim 'isRead' ama json'da 'read' olabilir. DTO'da 'isRead' var, Jackson 'read' olarak serialize eder genelde (boolean getter isRead ise field name read olur).
        }));
    },

    // Tekli okundu işaretle
    markAsRead: async (id: string) => {
        await api.put(`/notifications/${id}/read`);
    },

    // Hepsini okundu işaretle (Backend'de toplu endpoint yoksa loop ile yapıyoruz)
    markAllAsRead: async (ids: string[]) => {
        const promises = ids.map(id => api.put(`/notifications/${id}/read`));
        await Promise.all(promises);
    },

    // Okunmamış sayısı
    getUnreadCount: async (): Promise<number> => {
        const response = await api.get('/notifications/unread-count');
        return response.data;
    },

    // Bildirimi sil
    deleteNotification: async (id: string) => {
        await api.delete(`/notifications/${id}`);
    }
};

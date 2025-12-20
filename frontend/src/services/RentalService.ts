import api from '../api/axiosConfig';

export const RentalService = {
    rentBook: async (bookId: string) => {
        // Backend'deki /api/rentals/rent endpoint'ini çağırır
        const response = await api.post('/rentals', { bookId });
        return response.data;
    },

    getUserRentals: async () => {
        const response = await api.get('/rentals/my-rentals');
        return response.data;
    },

    // Tüm bekleyen talepleri getir (Librarian/Admin için)
    getAllRequests: async () => {
        const response = await api.get('/api/rentals/requests'); // Backend'de bu endpoint'i kontrol et
        return response.data;
    },

    // Talebi onayla
    approveRequest: async (rentalId: number) => {
        const response = await api.post(`/rentals/approve/${rentalId}`);
        return response.data;
    }
};
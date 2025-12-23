import api from '../api/axiosConfig';

export const RentalService = {
    rentBook: async (bookId: string) => {
        // Backend'deki /api/rentals/rent endpoint'ini çağırır
        const response = await api.post('/rentals', { bookId });
        return response.data;
    },

    getUserRentals: async () => {
        const response = await api.get('/users/book-history');
        return response.data;
    },

    // Tüm bekleyen talepleri getir (Librarian/Admin için)
    getAllRequests: async () => {
        const response = await api.get('/rentals/requests'); // Fixed: Removed double /api
        return response.data;
    },

    // Talebi onayla
    approveRequest: async (rentalId: number) => {
        const response = await api.post(`/rentals/approve/${rentalId}`);
        return response.data;
    },

    // Talebi reddet
    rejectRequest: async (rentalId: number) => {
        const response = await api.post(`/rentals/reject/${rentalId}`);
        return response.data;
    },

    returnBook: async (rentalId: number) => {
        const response = await api.put(`/rentals/${rentalId}/return`);
        return response.data;
    }
};
import api from '../api/axiosConfig';

export const RentalService = {
    rentBook: async (bookId: string) => {
        // Calls the /api/rentals/rent endpoint on the backend
        const response = await api.post('/rentals', { bookId });
        return response.data;
    },

    getUserRentals: async () => {
        const response = await api.get('/users/book-history');
        return response.data;
    },

    // Get all pending requests (for Librarian/Admin)
    getAllRequests: async () => {
        const response = await api.get('/rentals/requests');
        return response.data;
    },

    // Approve request
    approveRequest: async (rentalId: number) => {
        const response = await api.post(`/rentals/approve/${rentalId}`);
        return response.data;
    },

    // Reject request
    rejectRequest: async (rentalId: number) => {
        const response = await api.post(`/rentals/reject/${rentalId}`);
        return response.data;
    },

    returnBook: async (rentalId: number) => {
        const response = await api.put(`/rentals/${rentalId}/return`);
        return response.data;
    }
};
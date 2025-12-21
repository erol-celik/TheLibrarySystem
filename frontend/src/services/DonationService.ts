import api from '../api/axiosConfig';

export interface DonationRequest {
    id: string; // Backend sends Long, strict typing might need number but string is safer for IDs in frontend usually, adapt if needed
    username?: string; // Backend might not send this directly in all endpoints, check DTO
    bookTitle: string;
    bookAuthor: string;
    description: string;
    requestDate?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const DonationService = {
    // Create a new donation request
    createDonation: async (data: { bookTitle: string; bookAuthor: string; description: string }) => {
        const response = await api.post('/donations', data);
        return response.data;
    },

    // Get my donation history
    getMyDonations: async () => {
        const response = await api.get<DonationRequest[]>('/donations/my-history');
        return response.data;
    },

    // Get all pending donations (Librarian/Admin)
    getPendingDonations: async () => {
        const response = await api.get<DonationRequest[]>('/librarian/donations/pending');
        return response.data;
    },

    // Process a donation (Approve/Reject)
    processDonation: async (id: string, approved: boolean, reason?: string) => {
        const response = await api.put(`/librarian/donations/${id}/process`, null, {
            params: { approved, reason }
        });
        return response.data;
    }
};

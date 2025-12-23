import api from '../api/axiosConfig';

export interface HomepageStats {
    totalBooks: number;
    totalDigitalBooks: number;
    categoryDistribution: Record<string, number>;
    totalUsers: number;
    activeRentals: number;
}

export interface LibrarianStats {
    borrowRequests: number;
    returnRequests: number;
    donationRequests: number;
    totalBooks: number;
    activeLoans: number;
    overdueBooks: number;
    booksBorrowedToday: number;
    booksReturnedToday: number;
    newDonationsToday: number;
}

export const DashboardService = {
    // Get public statistics (book count, user count, etc.)
    getPublicStats: async (): Promise<HomepageStats> => {
        const response = await api.get<HomepageStats>('/dashboard/public');
        return response.data;
    },
    // Get admin statistics
    getAdminStats: async () => {
        const response = await api.get('/dashboard/admin');
        return response.data;
    },
    // Get librarian statistics
    getLibrarianStats: async (): Promise<LibrarianStats> => {
        const response = await api.get<LibrarianStats>('/dashboard/librarian');
        return response.data;
    }
};

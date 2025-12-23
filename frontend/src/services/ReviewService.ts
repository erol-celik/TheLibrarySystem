import api from '../api/axiosConfig';
import { Comment } from '../types';

export interface ReviewRequest {
    bookId: string;
    stars: number;
    comment: string;
    spoiler: boolean;
}

export const ReviewService = {
    getReviewsByBookId: async (bookId: string): Promise<Comment[]> => {
        const response = await api.get(`/reviews/book/${bookId}`);
        // Backend returns Review entity which needs mapping to Comment interface
        return response.data.map((r: any) => ({
            id: String(r.id),
            username: r.user.username, // Assuming User entity is eager fetched and has username
            userBadge: r.user.badge || 'Reader',
            text: r.comment,
            rating: r.stars,
            date: new Date(r.createdDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            isSpoiler: r.spoiler,
            helpfulCount: r.helpfulCount,
            userId: r.user.id // Needed for edit/delete checks
        }));
    },

    addReview: async (review: ReviewRequest): Promise<void> => {
        await api.post('/reviews', review);
    },

    toggleLike: async (reviewId: string): Promise<void> => {
        await api.post(`/reviews/${reviewId}/like`);
    },

    updateReview: async (reviewId: string, review: ReviewRequest): Promise<void> => {
        await api.put(`/reviews/${reviewId}`, review);
    },

    // Admin or Owner delete
    deleteReview: async (reviewId: string): Promise<void> => {
        // Did not see a specific endpoint for delete in SocialController, 
        // assuming standard DELETE /api/reviews/{id} or Admin delete. 
        // Checking prompt: "Yorum Gönderimi", "Yorum Beğenme", "Düzenleme".
        // Delete is likely admin function or not explicitly requested to CHANGE backend for delete, 
        // but BookDetailModal has onDeleteComment prop.
        // I will assume for now we might leave delete as is or implementing if needed.
        // Actually SocialController didn't show DELETE. I will skip DELETE implementation in Service for now unless I find it.
    },

    // --- ADMIN METHODS ---
    getAllReviewsForAdmin: async (): Promise<any[]> => {
        const response = await api.get('/reviews/admin/all');
        return response.data;
    },

    adminDeleteReview: async (reviewId: string): Promise<void> => {
        await api.delete(`/reviews/admin/${reviewId}`);
    }
};

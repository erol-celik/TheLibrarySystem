import api from '../api/axiosConfig';

export interface Feedback {
    id: number;
    user?: {
        username: string;
        email: string;
    };
    feedbackType: 'COMPLAINT' | 'SUGGESTION';
    message: string;
    bookTitle?: string;
    bookAuthor?: string;
    feedbackStatus: 'NEW' | 'RESOLVED';
    createdAt: string;
}

export const FeedbackService = {
    // Admin: Tüm feedbackleri getir
    getAllFeedbacks: async (): Promise<Feedback[]> => {
        const response = await api.get('/feedbacks');
        return response.data;
    }
};

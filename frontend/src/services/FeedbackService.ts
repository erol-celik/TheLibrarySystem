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
    getAllFeedbacksAdmin: async (): Promise<Feedback[]> => {
        const response = await api.get('/feedbacks');
        // Filter out SUGGESTION type as they are handled in Suggestions tab usually, 
        // OR backend returns mixed. Let's assume backend returns all from FeedbackRepository.
        // But Suggestions in our system are stored in BookSuggestion entity usually?
        // Let's check backend service.
        // FeedbackService.java: getAllFeedbacks() returns feedbackRepository.findAll(). which stores 'Feedback' entity.
        // Feedback entity has 'feedbackType' which can be SUGGESTION.
        // BUT we also have 'BookSuggestion' entity and 'suggestionRepository'.
        // ContributionController.java -> createSuggestion -> suggestionRepository.save(BookSuggestion)
        // createFeedback -> feedbackRepository.save(Feedback)
        // So they are separate. 
        // getAllFeedbacksAdmin should fetch /feedbacks (Feedback entity)
        // getAllSuggestionsAdmin should fetch /admin/feedbacks (BookSuggestion entity) (Controller map: getPendingSuggestions)

        return response.data;
    },

    // Admin: BookSuggestions getir (Controller: /admin/feedbacks -> getPendingSuggestions)
    // Wait, controller name is confusing. getPendingSuggestions returns List<BookSuggestion>
    // but url is /admin/feedbacks. I should probably use that.
    getAllSuggestionsAdmin: async (): Promise<any[]> => {
        const response = await api.get('/admin/feedbacks');
        return response.data;
    },

    resolveFeedback: async (id: number, responseMessage: string): Promise<void> => {
        await api.put(`/admin/feedbacks/${id}/resolve`, null, { params: { response: responseMessage } });
    },

    updateSuggestionStatus: async (id: number, status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<void> => {
        await api.put(`/admin/feedbacks/${id}/status`, null, { params: { status } });
    }
};

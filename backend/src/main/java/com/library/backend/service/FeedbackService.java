package com.library.backend.service;

import com.library.backend.dto.contribution.FeedbackRequest;
import com.library.backend.dto.contribution.SuggestionRequest;
import com.library.backend.entity.*;
import com.library.backend.entity.enums.BookSuggestionStatus;
import com.library.backend.entity.enums.FeedbackStatus;
import com.library.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final BookSuggestionRepository suggestionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // --- FEEDBACK (Şikayet/Öneri) ---

    @Transactional
    public void createFeedback(String userEmail, FeedbackRequest request) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();

        Feedback feedback = new Feedback();
        feedback.setUser(user);
        feedback.setFeedbackType(request.getFeedbackType());
        feedback.setMessage(request.getMessage());
        feedback.setFeedbackStatus(FeedbackStatus.NEW);

        feedbackRepository.save(feedback);
    }

    // Admin/Librarian okur ve çözer
    @Transactional
    public void resolveFeedback(Long adminId, Long feedbackId, String responseMessage) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found."));

        feedback.setFeedbackStatus(FeedbackStatus.RESOLVED);
        feedbackRepository.save(feedback);

        // Bildirim
        String msg = "Your feedback regarding '" + feedback.getFeedbackType() + "' has been reviewed. Note: " + responseMessage;
        notificationService.sendNotificationById(adminId, feedback.getUser().getId(), msg);
    }

    // --- BOOK SUGGESTION (Kitap İsteği) ---

    @Transactional
    public void createSuggestion(String userEmail, SuggestionRequest request) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();

        BookSuggestion suggestion = new BookSuggestion();
        suggestion.setSuggesterUser(user);
        suggestion.setTitle(request.getBookTitle());
        suggestion.setAuthor(request.getBookAuthor());
        suggestion.setStatus(BookSuggestionStatus.PENDING);

        suggestionRepository.save(suggestion);
    }

    public List<BookSuggestion> getPendingSuggestions() {
        return suggestionRepository.findByStatus(BookSuggestionStatus.PENDING);
    }

    @Transactional
    public void updateSuggestionStatus(Long adminId, Long suggestionId, BookSuggestionStatus status) {
        BookSuggestion suggestion = suggestionRepository.findById(suggestionId)
                .orElseThrow(() -> new RuntimeException("Suggestion not found."));

        suggestion.setStatus(status);
        suggestionRepository.save(suggestion);

        // Bildirim (Sadece onay/red durumunda)
        if (status != BookSuggestionStatus.PENDING) {
            String msg = "Your book suggestion '" + suggestion.getTitle() + "' has been marked as: " + status;
            notificationService.sendNotificationById(adminId, suggestion.getSuggesterUser().getId(), msg);
        }
    }
}
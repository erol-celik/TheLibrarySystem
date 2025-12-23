package com.library.backend.service;

import com.library.backend.dto.contribution.BookSuggestionResponse;
import com.library.backend.dto.contribution.FeedbackRequest;
import com.library.backend.dto.contribution.FeedbackResponse;
import com.library.backend.dto.contribution.SuggestionRequest;
import com.library.backend.entity.*;
import com.library.backend.entity.enums.BookSuggestionStatus;
import com.library.backend.entity.enums.FeedbackStatus;
import com.library.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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

        if (request.getFeedbackType().toString().equals("SUGGESTION")) {
            feedback.setBookTitle(request.getBookTitle());
            feedback.setBookAuthor(request.getBookAuthor());
        }

        feedback.setFeedbackStatus(FeedbackStatus.NEW);

        feedbackRepository.save(feedback);
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> getAllFeedbacks() {
        return feedbackRepository.findAll().stream()
                .map(this::mapToFeedbackResponse)
                .collect(Collectors.toList());
    }

    // Admin/Librarian okur ve çözer
    @Transactional
    public void resolveFeedback(Long adminId, Long feedbackId, String responseMessage) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found."));

        feedback.setFeedbackStatus(FeedbackStatus.RESOLVED);
        feedbackRepository.save(feedback);

        // Bildirim
        String msg = "Your feedback regarding '" + feedback.getFeedbackType() + "' has been reviewed. Note: "
                + responseMessage;
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

    @Transactional(readOnly = true)
    public List<BookSuggestionResponse> getPendingSuggestions() {
        return suggestionRepository.findByStatus(BookSuggestionStatus.PENDING).stream()
                .map(this::mapToBookSuggestionResponse)
                .collect(Collectors.toList());
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

    // --- MAPPERS ---

    private FeedbackResponse mapToFeedbackResponse(Feedback feedback) {
        FeedbackResponse response = new FeedbackResponse();
        response.setId(feedback.getId());
        response.setFeedbackType(feedback.getFeedbackType().name());
        response.setMessage(feedback.getMessage());
        response.setBookTitle(feedback.getBookTitle());
        response.setBookAuthor(feedback.getBookAuthor());
        response.setFeedbackStatus(feedback.getFeedbackStatus().name());
        response.setCreatedDate(feedback.getCreatedDate());

        if (feedback.getUser() != null) {
            response.setUserId(feedback.getUser().getId());
            response.setUserName(feedback.getUser().getName());
            response.setUserEmail(feedback.getUser().getEmail());
        }
        return response;
    }

    private BookSuggestionResponse mapToBookSuggestionResponse(BookSuggestion suggestion) {
        BookSuggestionResponse response = new BookSuggestionResponse();
        response.setId(suggestion.getId());
        response.setTitle(suggestion.getTitle());
        response.setAuthor(suggestion.getAuthor());
        response.setStatus(suggestion.getStatus().name());
        response.setCreatedDate(suggestion.getCreatedDate());

        if (suggestion.getSuggesterUser() != null) {
            response.setUserId(suggestion.getSuggesterUser().getId());
            response.setUserName(suggestion.getSuggesterUser().getName());
            response.setUserEmail(suggestion.getSuggesterUser().getEmail());
        }
        return response;
    }
}
package com.library.backend.dto.contribution;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FeedbackResponse {
    private Long id;
    private String feedbackType;
    private String message;
    private String bookTitle;
    private String bookAuthor;
    private String feedbackStatus;
    private LocalDateTime createdDate;

    // User info
    private Long userId;
    private String userName;
    private String userEmail;
}

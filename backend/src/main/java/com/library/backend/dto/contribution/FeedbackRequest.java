package com.library.backend.dto.contribution;

import com.library.backend.entity.enums.FeedbackType;
import lombok.Data;

@Data
public class FeedbackRequest {
    private FeedbackType feedbackType; // COMPLAINT veya SUGGESTION
    private String message;
    private String bookTitle;
    private String bookAuthor;
}
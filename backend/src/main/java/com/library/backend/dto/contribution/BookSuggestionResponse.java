package com.library.backend.dto.contribution;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookSuggestionResponse {
    private Long id;
    private String title;
    private String author;
    private String status;
    private LocalDateTime createdDate;

    // User info
    private Long userId;
    private String userName;
    private String userEmail;
}

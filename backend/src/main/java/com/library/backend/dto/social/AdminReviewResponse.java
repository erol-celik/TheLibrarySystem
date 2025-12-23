package com.library.backend.dto.social;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminReviewResponse {
    private Long id;
    private String username;
    private String bookTitle;
    private Long bookId;
    private int rating;
    private String comment;
    private LocalDateTime date;
    private boolean isSpoiler;
}

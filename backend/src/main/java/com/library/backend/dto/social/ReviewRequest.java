package com.library.backend.dto.social;

import lombok.Data;

@Data
public class ReviewRequest {
    private Long bookId;
    private Integer stars; // 1-5 arası
    private String comment;
    private boolean isSpoiler; // kullanıcı seçmeli!
}
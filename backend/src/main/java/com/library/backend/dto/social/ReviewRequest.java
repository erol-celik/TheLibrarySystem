package com.library.backend.dto.social;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ReviewRequest {
    private Long bookId;
    private Integer stars; // 1-5 arası
    private String comment;

    @JsonProperty("isSpoiler")
    private boolean spoiler; // kullanıcı seçmeli!

    @JsonProperty("isSpoiler")
    public boolean isSpoiler() {
        return spoiler;
    }

    @JsonProperty("isSpoiler")
    public void setSpoiler(boolean spoiler) {
        this.spoiler = spoiler;
    }
}
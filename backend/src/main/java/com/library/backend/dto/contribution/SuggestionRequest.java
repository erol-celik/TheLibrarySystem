package com.library.backend.dto.contribution;

import lombok.Data;

@Data
public class SuggestionRequest {
    private String bookTitle;
    private String bookAuthor;
}
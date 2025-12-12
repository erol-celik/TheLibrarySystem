package com.library.backend.dto.contribution;

import lombok.Data;

@Data
public class DonationRequest {
    private String bookTitle;
    private String bookAuthor;
    private String description; // Kitabın durumu (yırtık mı, yeni mi?)
}
package com.library.backend.dto.response;

import lombok.Data;

@Data
public class BookResponse {
    private Long id;
    private String title;
    private String author;
    private String imageUrl; // Kapak resmi için
    private String categoryName; // Category objesi değil, sadece ismi
    private boolean isEditorsPick; // Editörün seçimi mi?
}
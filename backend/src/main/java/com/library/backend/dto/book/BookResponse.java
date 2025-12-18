package com.library.backend.dto.book;

import com.library.backend.entity.Tag;
import com.library.backend.entity.enums.BookType;
import com.library.backend.entity.enums.RentalStatus;
import jakarta.persistence.Column;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Set;

@Data
public class BookResponse {
    private String title;
    private String author;
    private String description;
    private String isbn; // Barkod/ISBN no
    private String publisher; // Yayınevi
    private Integer publicationYear; // Basım Yılı
    private Integer pageCount;
    private Integer availableStock;
    private BookType bookType;
    private RentalStatus status;
    private BigDecimal price;
    private String ebookFilePath;
    private String imageUrl; // Kapak resmi için
    private Set<String> categories;
    private boolean isEditorsPick; // Editörün seçimi mi?
    private Set<String> tags;
    private Double rating = 0.0; // Örn: 4.5
    private Integer reviewCount = 0;
}
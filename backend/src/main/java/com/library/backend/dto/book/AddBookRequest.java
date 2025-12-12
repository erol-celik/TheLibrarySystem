package com.library.backend.dto.book;

import com.library.backend.entity.Category;
import com.library.backend.entity.Tag;
import com.library.backend.entity.enums.BookType;
import com.library.backend.entity.enums.RentalStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Set;

@Data
public class AddBookRequest {
    private String title;
    private String author;
    private String description;
    private String isbn; // Barkod/ISBN no
    private String publisher; // Yayınevi
    private Integer publicationYear; // Basım Yılı
    private Integer pageCount;
    private Integer totalStock;
    private BookType bookType;
    private BigDecimal price;
    private String ebookFilePath;
    private String imageUrl; // Kapak resmi için
    private String category; // Category objesi değil, sadece ismi
    private Set<String> tags;
}

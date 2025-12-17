// backend/src/main/java/com/library/backend/dto/book/BookFilterRequest.java

package com.library.backend.dto.book;

import lombok.Data;

@Data
public class BookFilterRequest {
    private String keyword;    // Arama çubuğu (Title/Author/ISBN)
    private String category;   // "Adventure", "Sci-Fi" vb.
    private Boolean available; // true ise sadece stokta olanlar

    // Sayfalama ve Sıralama
    private Integer page = 0;
    private Integer size = 10;
    private String sortBy = "title"; // Varsayılan sıralama: Başlık
    private String direction = "asc";
}

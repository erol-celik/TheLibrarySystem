package com.library.backend.repository;

import com.library.backend.entity.BookSuggestion;
import com.library.backend.entity.enums.BookSuggestionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookSuggestionRepository extends JpaRepository<BookSuggestion, Long> {
    // Admin için: Sadece 'PENDING' olanları getir
    List<BookSuggestion> findByStatus(BookSuggestionStatus status);
}
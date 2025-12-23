package com.library.backend.repository;

import com.library.backend.entity.BookSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;

public interface BookSaleRepository extends JpaRepository<BookSale, Long> {
    // List books purchased by a user
    List<BookSale> findByUserId(Long userId);

    // Check if user purchased this book
    boolean existsByUserIdAndBookId(Long userId, Long bookId);

    // Calculate total revenue from book sales
    @Query("SELECT COALESCE(SUM(b.soldPrice), 0) FROM BookSale b")
    BigDecimal calculateTotalRevenue();
}
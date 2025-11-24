package com.library.backend.repository;

import com.library.backend.entity.BookSale;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookSaleRepository extends JpaRepository<BookSale, Long> {
    // Bir kullanıcının satın aldığı kitapları listelemek için
    List<BookSale> findByUserId(Long userId);
}
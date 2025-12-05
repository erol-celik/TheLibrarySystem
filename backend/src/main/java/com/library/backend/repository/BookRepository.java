package com.library.backend.repository;

import com.library.backend.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {

    // 1. Editörün seçtiklerini getir
    List<Book> findByIsEditorsPickTrue();

    // 2. En son eklenen 10 kitabı getir (Tarihe göre azalan sırala ve ilk 10'u al)
    List<Book> findTop10ByOrderByCreatedDateDesc();

    // Not: "Popüler" mantığı için şimdilik tüm kitapları çekip işlem yapacağız
    // veya ilerde Rental tablosuna bağlayacağız.
}
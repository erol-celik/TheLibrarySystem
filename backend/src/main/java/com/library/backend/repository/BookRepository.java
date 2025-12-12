package com.library.backend.repository;

import com.library.backend.entity.Book;
import com.library.backend.entity.enums.BookType;
import com.library.backend.entity.enums.RentalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, Long> {

    // 1. Editörün seçtiklerini getir
    List<Book> findByIsEditorsPickTrue();

    // 2. En son eklenen 10 kitabı getir (Tarihe göre azalan sırala ve ilk 10'u al)
    List<Book> findTop10ByOrderByCreatedDateDesc();

    List<Book> findByAuthorIgnoreCase(String author);

    List<Book> findByRentalStatus(RentalStatus status);

    List<Book> findByBookType(BookType status);

    List<Book> findByTitleContainingIgnoreCase(String title);

    Book findByIsbn(String isbn);


    // Not: "Popüler" mantığı için şimdilik tüm kitapları çekip işlem yapacağız
    // veya ilerde Rental tablosuna bağlayacağız.
}
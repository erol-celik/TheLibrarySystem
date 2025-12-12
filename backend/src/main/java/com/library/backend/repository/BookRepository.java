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
    // Sınıfın içine ekle:

    // 1. Kategorilere göre kitap dağılımı (Örn: Bilim Kurgu - 150 adet)
    // Bu sorgu veritabanında "GROUP BY" işlemi yapar, Java'yı yormaz.
    @org.springframework.data.jpa.repository.Query("SELECT b.category.name, COUNT(b) FROM Book b GROUP BY b.category.name")
    List<Object[]> countBooksByCategory();

    // 2. Stoğu kritik seviyenin (Örn: 3) altına düşen fiziksel kitaplar
    List<Book> findByAvailableStockLessThanAndBookType(int stockLimit, com.library.backend.entity.enums.BookType bookType);


    // Not: "Popüler" mantığı için şimdilik tüm kitapları çekip işlem yapacağız
    // veya ilerde Rental tablosuna bağlayacağız.
}
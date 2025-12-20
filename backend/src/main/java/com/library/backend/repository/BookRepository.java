package com.library.backend.repository;

import com.library.backend.entity.Book;
import com.library.backend.entity.enums.BookType;
import com.library.backend.entity.enums.RentalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, Long>, JpaSpecificationExecutor<Book> {

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
        // @org.springframework.data.jpa.repository.Query("SELECT b.category.name,
        // COUNT(b) FROM Book b GROUP BY b.category.name")
        // List<Object[]> countBooksByCategory();

        // DÜZELTME 1: b.category yerine b.categories kullanıldı ve JOIN eklendi
        @Query("SELECT c.name, COUNT(b) FROM Book b JOIN b.categories c GROUP BY c.name")
        List<Object[]> countBooksByCategory();

        // 2. Stoğu kritik seviyenin (Örn: 3) altına düşen fiziksel kitaplar
        List<Book> findByAvailableStockLessThanAndBookType(int stockLimit,
                        com.library.backend.entity.enums.BookType bookType);

        Book findByIsbn(String isbn);

        /*
         * @Query("SELECT b FROM Book b WHERE " +
         * // 1. ARAMA ÇUBUĞU (Title, Author veya ISBN'de ara)
         * "(:keyword IS NULL OR (" +
         * "   LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
         * "   LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
         * "   LOWER(b.isbn) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
         * ")) " +
         * "AND " +
         * // 2. KATEGORİ FİLTRESİ (Seçildiyse eşleştir, yoksa geç)
         * "(:category IS NULL OR b.category.name = :category) " +
         * "AND " +
         * // 3. STOK DURUMU ('Available Only' seçildiyse stok > 0 olsun)
         * "(:available IS NULL OR :available = false OR b.availableStock > 0)")
         * Page<Book> searchBooks(
         * 
         * @Param("keyword") String keyword,
         * 
         * @Param("category") String category,
         * 
         * @Param("available") Boolean available,
         * Pageable pageable
         * );
         */
        Optional<Book> findByTitleContainingIgnoreCaseAndBookType(String bookTitle, BookType bookType);

        // Not: "Popüler" mantığı için şimdilik tüm kitapları çekip işlem yapacağız
        // veya ilerde Rental tablosuna bağlayacağız.

        // DÜZELTME 2: Corrected JOIN and Alias usage for filtering
        // USER REQUEST: Must use JOIN to ensure category filtering works strictly with
        // "content: []" fix.
        @Query(value = "SELECT DISTINCT b FROM Book b LEFT JOIN b.categories c WHERE " +
                        "(:keyword IS NULL OR (" +
                        "   LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "   LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "   LOWER(b.isbn) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
                        ")) " +
                        "AND " +
                        "(:category IS NULL OR LOWER(c.name) = LOWER(:category)) " +
                        "AND (" +
                        "   :available IS NULL OR " +
                        "   (:available = true AND b.availableStock > 0) OR " +
                        "   (:available = false AND b.availableStock = 0)" +
                        ")", countQuery = "SELECT COUNT(DISTINCT b) FROM Book b LEFT JOIN b.categories c WHERE " +
                                        "(:keyword IS NULL OR (" +
                                        "   LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                                        "   LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                                        "   LOWER(b.isbn) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
                                        ")) " +
                                        "AND " +
                                        "(:category IS NULL OR LOWER(c.name) = LOWER(:category)) " +
                                        "AND (" +
                                        "   :available IS NULL OR " +
                                        "   (:available = true AND b.availableStock > 0) OR " +
                                        "   (:available = false AND b.availableStock = 0)" +
                                        ")")
        Page<Book> searchBooks(
                        @Param("keyword") String keyword,
                        @Param("category") String category,
                        @Param("available") Boolean available,
                        Pageable pageable);

}
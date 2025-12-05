package com.library.backend.repository;

import com.library.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Bir kitaba ait yorumları getirirken User bilgisini de EAGER (tek seferde) yükle.
    // Bu yöntem veritabanı performansını kurtarır.
    @Query("SELECT r FROM Review r JOIN FETCH r.user WHERE r.book.id = :bookId ORDER BY r.helpfulCount DESC, r.createdDate DESC")
    List<Review> findReviewsByBookId(@Param("bookId") Long bookId);

    // Belirli bir kullanıcının belirli bir kitaba yorum yapıp yapmadığını kontrol et
    boolean existsByUserIdAndBookId(Long userId, Long bookId);
}
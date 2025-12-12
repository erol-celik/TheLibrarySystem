package com.library.backend.repository;

import com.library.backend.entity.ReviewLike;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Long> {
    // kullanıcı bu yorumu daha önce beğendi mi?
    boolean existsByUserIdAndReviewId(Long userId, Long reviewId);

    // beğeniyi geri almak (unlike) için kaydı bul
    Optional<ReviewLike> findByUserIdAndReviewId(Long userId, Long reviewId);
}
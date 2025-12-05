package com.library.backend.repository;

import com.library.backend.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {

    // Bir kullanıcının kazandığı tüm rozetleri listelemek için.
    // JOIN FETCH ile rozet bilgisini de tek sorguda çekerek N+1 sorununu engeller.
    @Query("SELECT ub FROM UserBadge ub JOIN FETCH ub.badge WHERE ub.user.id = :userId ORDER BY ub.earnedAt DESC")
    List<UserBadge> findAllByUserId(Long userId);

    // Kullanıcının belirli bir rozeti daha önce kazanıp kazanmadığını kontrol etmek için
    boolean existsByUserIdAndBadgeName(Long userId, String badgeName);
}
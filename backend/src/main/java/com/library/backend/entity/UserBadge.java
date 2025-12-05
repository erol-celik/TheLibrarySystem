package com.library.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_badges", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "badge_id"})
})
@Data
@EqualsAndHashCode(callSuper = true)
public class UserBadge extends BaseEntity {

    // Rozeti kazanan kullanıcı
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Kazanılan rozetin tanımı
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "badge_id", nullable = false)
    private Badge badge;

    // Rozetin kazanıldığı tarih (Hangi sırayla kazanıldığını bilmek için önemli)
    @Column(name = "earned_at", nullable = false)
    private LocalDateTime earnedAt = LocalDateTime.now();
}
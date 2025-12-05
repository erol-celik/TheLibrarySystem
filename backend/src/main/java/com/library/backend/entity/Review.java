package com.library.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "reviews", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "book_id"})
})
@Data
@EqualsAndHashCode(callSuper = true)
public class Review extends BaseEntity {

    // Değerlendiren Kullanıcı
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Değerlendirilen Kitap
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    // Puan (1-5)
    @Column(nullable = false)
    private Integer stars;


    // Yorum Metni (Uzun olabileceği için TEXT)
    @Column(columnDefinition = "TEXT")
    private String comment;

    // Spoiler içeriyor mu?
    @Column(name = "is_spoiler", nullable = false)
    private boolean isSpoiler = false;

    // Kaç kişi faydalı buldu?
    @Column(name = "helpful_count", nullable = false)
    private int helpfulCount = 0;
}
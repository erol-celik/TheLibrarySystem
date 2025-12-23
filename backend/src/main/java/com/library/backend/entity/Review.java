package com.library.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "reviews", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "user_id", "book_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Review extends BaseEntity {

    // Değerlendiren Kullanıcı
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Değerlendirilen Kitap
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    @JsonIgnore
    private Book book;

    // Puan (1-5)
    @Column(nullable = false)
    private Integer stars;

    // Yorum Metni (Uzun olabileceği için TEXT)
    @Column(columnDefinition = "TEXT")
    private String comment;

    // Spoiler içeriyor mu?
    @Column(name = "is_spoiler", nullable = false)
    @JsonProperty("isSpoiler")
    private boolean spoiler = false;

    @JsonProperty("isSpoiler")
    public boolean isSpoiler() {
        return spoiler;
    }

    @JsonProperty("isSpoiler")
    public void setSpoiler(boolean spoiler) {
        this.spoiler = spoiler;
    }

    // Kaç kişi faydalı buldu?
    @Column(name = "helpful_count", nullable = false)
    private int helpfulCount = 0;
}
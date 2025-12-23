package com.library.backend.entity;

import com.library.backend.entity.enums.DonationStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;

@Entity
@Table(name = "donations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Donation extends BaseEntity {

    // bağış yapan kullanıcı
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // KİTABIN ADI (Henüz Book tablosunda olmadığı için String tutuyoruz)
    @Column(name = "book_title", nullable = false)
    private String bookTitle;

    // KİTABIN YAZARI (Bilgi amaçlı)
    @Column(name = "book_author")
    private String bookAuthor;

    // AÇIKLAMA (Kitap durumu vb.)
    @Column(name = "description")
    private String description;

    // bağış statusu
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationStatus status;

}
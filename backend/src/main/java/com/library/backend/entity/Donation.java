package com.library.backend.entity;

import com.library.backend.entity.enums.DonationStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;

@Entity
@Table(name = "donations")
@Data
@EqualsAndHashCode(callSuper = true)
public class Donation extends BaseEntity {


    //bağış yapan kullanıcı
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // KİTABIN ADI (Henüz Book tablosunda olmadığı için String tutuyoruz)
    @Column(name = "book_title", nullable = false)
    private String bookTitle;

    // KİTABIN YAZARI (Bilgi amaçlı)
    @Column(name = "book_author")
    private String bookAuthor;

    // bağış statusu
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationStatus status;

    // NE KADAR KREDİ VERİLECEK? (Admin belirler, başta null olabilir)
    @Column(name = "credit_amount", precision = 10, scale = 2)
    private BigDecimal creditAmount;
}
package com.library.backend.entity;

import com.library.backend.entity.enums.RentalStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "rentals")
@Data
@EqualsAndHashCode(callSuper = true)
public class Rental extends BaseEntity {

    @Id//pk rent id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rental_id")
    private Long id;

    // fk-kiralayan kullanıcı
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // fk-kiralanan kitap
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    // kiralama zamanı
    @Column(nullable = false)
    private LocalDate rentDate;

    // return zamanı
    @Column(nullable = false)
    private LocalDate dueDate;

    // NE ZAMAN GETİRDİ? (Başlangıçta NULL olur)
    @Column(name = "return_date", nullable = true)
    private LocalDate returnDate;

    // rentalstatus
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RentalStatus status;

    // penalty hesaplama başlangıçta 0
    @Column(name = "penalty_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal penaltyFee = BigDecimal.ZERO;
}
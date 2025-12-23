package com.library.backend.entity;

import com.library.backend.entity.enums.RentalStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "rentals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Rental extends BaseEntity {

    // FK - renting user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // FK - rented book
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    // Rent start date (set when approved, null until then)
    @Column(nullable = true)
    private LocalDate rentDate;

    // Due date (set when approved, null until then)
    @Column(nullable = true)
    private LocalDate dueDate;

    // Actual return date (null until returned)
    @Column(name = "return_date", nullable = true)
    private LocalDate returnDate;

    // Rental status (uses VARCHAR for flexibility with enum changes)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private RentalStatus status;

    // Penalty fee (starts at 0)
    @Column(name = "penalty_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal penaltyFee = BigDecimal.ZERO;
}
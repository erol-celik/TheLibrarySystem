package com.library.backend.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.sql.ConnectionBuilder;

@Entity
@Table(name="wallet")
@Data
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "wallet_id")
    private Long id; // PK: wallet_id

    // 1:1 İLİŞKİ: Bu cüzdanın hangi kullanıcıya ait olduğunu belirtir.
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false) // user_id FK, UNIQUE olması 1:1'i zorunlu kılar.
    private User user; // FK'yi User Entity'sine bağlar.

    // BALANCE NİTELİĞİ (DECIMAL(10, 2))
    @Column(nullable = false, precision = 10, scale = 2) // Kesin para hesaplaması için BigDecimal kullanılır.
    private BigDecimal balance = BigDecimal.ZERO;


}
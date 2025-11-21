package com.library.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users") // Veritabanında 'users' adında tablo oluşturacak
@Data // Lombok: Getter, Setter, toString metodlarını otomatik yazar
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // İleride hashlenmiş olacak

    @Column(nullable = false)
    private String name;

    // Bakiyeyi (Wallet) daha sonra ekleyeceğiz, şimdilik temel çalışsın.
}
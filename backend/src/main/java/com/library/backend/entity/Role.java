package com.library.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name="roles")//veritabanında tablo oluşturur
@Data//lombok getter setter kurar
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="role_id")
    private Long role_id;//pk role id

    @Column(nullable = false,unique = true)
    private String name;//rol adı admin user librarian
}

package com.library.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    // --- KRİTİK DÜZELTME BURADA ---
    @ManyToMany(mappedBy = "categories")
    @JsonIgnore // <--- BU EKLENDİ: Kategoriyi çekerken içindeki kitapları tekrar getirme
    private Set<Book> books = new HashSet<>();
}
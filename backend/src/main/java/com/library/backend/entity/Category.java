package com.library.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Set;


@Entity
@Table(name="categories")//veritabanında tablo oluşturur
@Data//lombok getter setter kurar
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="category_id")
    private Long category_id;//pk kategori id

    @Column(nullable = false,unique = true)
    private String name;//kategori ismi

    //bu ilişkinin yönetimi book varlığında
    @ManyToMany(mappedBy = "categories")
    private Set<Book> books;


}

package com.library.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import tools.jackson.core.ObjectReadContext;

import java.util.HashSet;
import java.util.Set;


@Entity
@Table(name="categories")//veritabanında tablo oluşturur
@Data//lombok getter setter kurar
@EqualsAndHashCode(callSuper = true)
public class Category extends BaseEntity {


    @Column(nullable = false,unique = true)
    private String name;//kategori ismi

    //bu ilişkinin yönetimi book varlığında
    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    private Set<Book> books = new HashSet<>();


}

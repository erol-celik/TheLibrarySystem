package com.library.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;

@Entity
@Table(name="books")//veritabanında tablo oluşturur
@Data//lombok getter setter kurar
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="book_id")
    private long id;//pk id

    @Column(nullable = false)
    private String title;//at

    @Column(nullable = false)
    private String author;//yazar

    @Enumerated(EnumType.STRING)
    @Column(name = "book_type", nullable = false)
    private BookType bookType;// dijital-fiziki-ikisi

    @Column(name="price")
    private BigDecimal price;//dijital satın alam fiyatı

    @Column(name = "ebook_file_path")
    private String ebookFilePath; // dijital link

    @Column(nullable = false)
    private Integer totalStock; //toplam fiziki kopya sayısı

    @Column(nullable = false)
    private Integer availableStock;// ödünç verilebilir fiziki kopya sayısı

    @Column(nullable = false)
    private LocalTime created_at; // kütüphaneye eklenme zamanı

    // NOT: User ve Category ilişkileri buraya daha sonra eklenecek.
}

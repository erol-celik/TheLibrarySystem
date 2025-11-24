package com.library.backend.entity;

import com.library.backend.entity.enums.BookType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name="books")//veritabanında tablo oluşturur
@Data//lombok getter setter kurar
@EqualsAndHashCode(callSuper = true)
public class Book  extends BaseEntity{

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

    // REZERVASYON (Opsiyonel - Tek Kişilik)
    @Column(name = "reserved_by_user_id")
    private Long reservedByUserId;

    @ManyToMany
    @JoinTable(
            name = "book_categories",//bu bir ara table. er diagramda var ama entity olarak yok.
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>(); // NullPointer yememek için başlatıyoruz

    // NOT: User ve Category ilişkileri buraya daha sonra eklenecek.
}

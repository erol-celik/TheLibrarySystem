package com.library.backend.entity;

import com.library.backend.entity.enums.BookType;
import com.library.backend.entity.enums.RentalStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.With;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Entity
@Table(name="books")//veritabanında tablo oluşturur
@Data//lombok getter setter kurar
@EqualsAndHashCode(callSuper = true, exclude = {"category", "tags"})

public class Book  extends BaseEntity{


    @Column(nullable = false)
    private String title;//at
    @Column(nullable = false)
    private String author;//yazar

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RentalStatus rentalStatus;

    @Column(nullable = false, unique = true)
    private String isbn; // Barkod/ISBN no

    @Column(name = "publisher")
    private String publisher; // Yayınevi

    @Column(name = "publication_year")
    private Integer publicationYear; // Basım Yılı

    @Column(name = "page_count")
    private Integer pageCount; // Sayfa Sayısı (Kısa/Uzun kitap filtresi için)

    @Column(columnDefinition = "TEXT")
    private String description; // Kitap Özeti (Uzun metin)

    @Column(name = "image_url")
    private String imageUrl; // Kapak resmi linki (Frontend için)

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

    @Column(name = "rating")
    private Double rating = 0.0; // Örn: 4.5

    @Column(name = "review_count")
    private Integer reviewCount = 0;

    @Column(name = "is_editors_pick")
    private boolean isEditorsPick = false; // Editörün seçimi mi?

    // REZERVASYON (Opsiyonel - Tek Kişilik)
    @Column(name = "reserved_by_user_id")
    private Long reservedByUserId;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    // --- DÜZELTME BURADA YAPILDI ---
    // Hatanın sebebi burasıydı. Category entity'si "category" adında tekil bir alan bekliyordu.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    // NOT: Artık "Liste" olmadığı için addCategory ve removeCategory metodlarını kaldırdık.
    // Lombok sayesinde "setCategory(category)" metodun zaten hazır.

    //2. TAGLER (Kör Randevu / Vibe Filtresi İçin - YENİ)
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "book_tags",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )

    private Set<Tag> tags = new HashSet<>();

    // Tag Ekleme/Çıkarma (Kör randevu mantığı için gerekli)
    public void addTag(Tag tag) {
        this.tags.add(tag);
        tag.getBooks().add(this);
    }

    public void removeTag(Tag tag) {
        this.tags.remove(tag);
        tag.getBooks().remove(this);
    }
}
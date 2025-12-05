package com.library.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

// @MappedSuperclass: Bu sınıfın veritabanında kendi tablosu OLMAYACAK demektir.
// Ancak bu sınıftan miras alan (extends) User, Book, Rental gibi sınıfların tablolarına
// buradaki 'created_at' ve 'updated_at' sütunları otomatik olarak eklenecektir.
@MappedSuperclass
@Data // Lombok: Getter, Setter, toString gibi metodları bizim yerimize yazar.
public abstract class BaseEntity {

    // --- EKLENEN KISIM (ID EKSİKTİ) ---
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    // ----------------------------------

    // Kural: Bir kayıt oluşturulduğu anın tarihi tutulur ve bir daha ASLA değiştirilemez.
    // updatable = false: Bu sütuna SQL UPDATE atılmasını engeller.
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    // Kural: Bir kayıt üzerinde her değişiklik yapıldığında bu tarih güncellenmelidir.
    @Column(name = "updated_at")
    private LocalDateTime updateDate;

    // FONKSİYON 1: Yaratılış Anı Yakalayıcısı
    // @PrePersist: Bu notasyon, "Veritabanına INSERT (Kaydetme) işlemi gitmeden hemen önce bu metodu çalıştır" der.
    // Bizim manuel olarak setCreatedAt(now) dememize gerek kalmaz.
    @PrePersist
    protected void onCreate() {
        // Sunucunun o anki saatini alır.
        createdDate = LocalDateTime.now();
        // İlk yaratıldığında güncelleme tarihi de o anki zamandır.
        updateDate = LocalDateTime.now();
    }

    // FONKSİYON 2: Güncelleme Anı Yakalayıcısı
    // @PreUpdate: Bu notasyon, "Veritabanına UPDATE (Güncelleme) işlemi gitmeden hemen önce bu metodu çalıştır" der.
    // Örnek: Kullanıcı şifresini değiştirdiğinde veya kitap stoğu düştüğünde burası çalışır.
    @PreUpdate
    protected void onUpdate() {
        // Sadece güncelleme tarihini o anki zamana çekeriz.
        // createdAt'e dokunmayız, o sabittir.
        updateDate = LocalDateTime.now();
    }
}
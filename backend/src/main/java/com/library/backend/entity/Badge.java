package com.library.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "badges")
@Data
@EqualsAndHashCode(callSuper = true)
public class Badge extends BaseEntity {


    // Rozetin benzersiz ismi (Örn: "KITAP_KURDU", "ELESTIRMEN")
    @Column(name = "name", unique = true, nullable = false)
    private String name;

    // Rozetin kullanıcı arayüzünde gösterilecek başlığı (Örn: "Kitap Kurdu")
    @Column(name = "title", nullable = false)
    private String title;

    // Rozetin kazanılma koşulunun açıklaması
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // Frontend'de kullanılacak ikon veya resim yolu (Örn: /assets/icons/book_worm.svg)
    @Column(name = "icon_path")
    private String iconPath;
}
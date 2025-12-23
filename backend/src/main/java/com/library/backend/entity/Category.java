package com.library.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
// Lombok'un oluşturduğu hashCode metodunda "books" listesini hariç tutuyoruz.
// Bunu yapmazsan, uygulama çalışırken birbirini çağıran sonsuz döngüye girer ve
// çöker.
@EqualsAndHashCode(callSuper = true, exclude = "books")
public class Category extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description; // İleride lazım olabilir, eklenmesi iyi pratiktir.

    // İLİŞKİ YÖNETİMİ
    // mappedBy = "categories" -> Book sınıfındaki "private Set<Category>
    // categories" alanını işaret eder.
    // Bu taraf "Inverse" (Pasif) taraftır. Veritabanında ilişki tablosunu Book
    // yönetir.
    @ManyToMany(mappedBy = "categories", fetch = FetchType.LAZY)
    @JsonIgnore // API yanıtında Kategori içindeki kitap listesini gizler.
    private Set<Book> books = new HashSet<>();
}
package com.library.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "tags")
@Data
@EqualsAndHashCode(callSuper = true, exclude = "books") // İlişkileri Equals/HashCode'dan çıkar.
@ToString(exclude = "books") // Sonsuz döngüyü engelle
public class Tag extends BaseEntity {


    // Tag'in ismi (Örn: 'Hüzünlü', 'Fast-Paced')
    @Column(name = "name", unique = true, nullable = false)
    private String name;

    // --- Many-to-Many İlişki ---
    // Bu taraf, Book sınıfında tanımlanan ilişkiye bağlıdır (mappedBy).
    @ManyToMany(mappedBy = "tags", fetch = FetchType.EAGER)
    private Set<Book> books = new HashSet<>();
}
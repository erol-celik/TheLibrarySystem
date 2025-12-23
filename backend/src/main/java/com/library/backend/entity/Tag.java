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
@Table(name = "tags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, exclude = "books") // İlişkileri Equals/HashCode'dan çıkar.
public class Tag extends BaseEntity {

    // Tag'in ismi (Örn: 'Hüzünlü', 'Fast-Paced')
    @Column(name = "name", unique = true, nullable = false)
    private String name;

    // --- Many-to-Many İlişki ---
    // Bu taraf, Book sınıfında tanımlanan ilişkiye bağlıdır (mappedBy).
    @ManyToMany(mappedBy = "tags", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Book> books = new HashSet<>();
}
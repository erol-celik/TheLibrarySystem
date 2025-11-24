package com.library.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "ratings", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "book_id"})})
//book ve user unique(bir kullanıcı birden fazla değerlendrime yapamaz)

@Data
@EqualsAndHashCode(callSuper = true)
public class Rating extends BaseEntity {

    @Id//pk rating id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rating_id")
    private Long id;

    //fk-user değerlendiren
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    //fk-kitap değerlendirilen
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    //kaç yıldız
    @Column(nullable = false)
    private Integer stars;
}
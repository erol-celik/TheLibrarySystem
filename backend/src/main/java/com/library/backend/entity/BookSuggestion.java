package com.library.backend.entity;

import com.library.backend.entity.enums.BookSuggestionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "book_suggestions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class BookSuggestion extends BaseEntity {

    // fk - öneren user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suggester_user_id", nullable = false)
    private User suggesterUser;

    // kitap adı
    @Column(nullable = false)
    private String title;

    // yazar adı must
    @Column(nullable = false)
    private String author;

    // status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookSuggestionStatus status = BookSuggestionStatus.PENDING; // default
}
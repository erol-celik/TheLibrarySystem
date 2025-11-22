package com.library.backend.entity;

// Kitabın fiziksel mi, dijital mi, yoksa hibrit mi olduğunu tanımlar.
public enum BookType {
    PHYSICAL,  // Sadece fiziksel kopya
    DIGITAL,   // Sadece e-kitap
    HYBRID     // Hem fiziksel hem e-kitap (Çoğu durumda bu olacak)
}
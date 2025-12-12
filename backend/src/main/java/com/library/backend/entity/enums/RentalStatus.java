package com.library.backend.entity.enums;

public enum RentalStatus {
    REQUESTED,
    APPROVED,
    RENTED,      // <-- Bunu ekle (Genelde scriptler bunu kullanır)
    RETURNED,
    LATE,
    REJECTED,
    AVAILABLE,
    LOST         // <-- Bunu da eklemen iyi olur (Kaybolan kitaplar için)
}
package com.library.backend.entity.enums;

public enum BookSuggestionStatus {
    PENDING,    // İnceleniyor
    APPROVED,   // Kabul edildi (Sipariş verilecek)
    REJECTED    // Reddedildi (Zaten var veya uygunsuz)
}
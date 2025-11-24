package com.library.backend.entity.enums;

public enum DonationStatus {
    PENDING,    // beklemede
    APPROVED,   // onaylandı, kredi yüklendi.
    REJECTED    // admin reddetti (yırtık kitap vb.)
}
package com.library.backend.entity.enums;

public enum RentalStatus {
    REQUESTED,  // kullanıcı talep etti , onay bekliyor
    APPROVED,   // kabul edildi,ödünç verildi
    RETURNED,   // iade edildi
    LATE,       // süresi gecikti
    REJECTED,    // onay verilmedi
    AVAILABLE
}
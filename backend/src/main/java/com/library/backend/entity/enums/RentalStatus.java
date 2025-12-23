package com.library.backend.entity.enums;

public enum RentalStatus {
    REQUESTED,
    APPROVED,
    RENTED,
    RETURN_PENDING, // User requested return, waiting for librarian approval
    RETURNED,
    LATE,
    REJECTED,
    AVAILABLE,
    LOST
}
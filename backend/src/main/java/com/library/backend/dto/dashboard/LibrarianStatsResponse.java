package com.library.backend.dto.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LibrarianStatsResponse {
    // Pending Actions
    private long borrowRequests; // REQUESTED status
    private long returnRequests; // RETURN_PENDING status
    private long donationRequests; // PENDING donations

    // Library Overview
    private long totalBooks; // Total book count
    private long activeLoans; // APPROVED status
    private long overdueBooks; // APPROVED + past due date

    // Today's Stats
    private long booksBorrowedToday; // APPROVED today
    private long booksReturnedToday; // RETURNED today
    private long newDonationsToday; // Donations created today
}

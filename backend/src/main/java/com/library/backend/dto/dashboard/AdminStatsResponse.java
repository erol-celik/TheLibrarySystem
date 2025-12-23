package com.library.backend.dto.dashboard;

import com.library.backend.dto.book.BookResponse;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class AdminStatsResponse {
    // Cards
    private long totalUsers;
    private long activeRentals;
    private BigDecimal totalRevenue;
    private long systemAlerts; // Total pending requests (borrow + return + donation)

    // Lists (Action Items)
    private List<String> overdueRentals;
    private List<BookResponse> lowStockBooks;
}
package com.library.backend.dto.dashboard;

import com.library.backend.dto.book.BookResponse; // Mevcut DTO'yu kullanabiliriz
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class AdminStatsResponse {
    // Kartlar
    private long totalUsers;
    private long activeRentals;
    private BigDecimal totalRevenue;

    // Listeler (Action Items)
    private List<String> overdueRentals; // Gecikenlerin özeti: "Ali - Dune (5 gün gecikti)"
    private List<BookResponse> lowStockBooks; // Stok alarmı verenler
}
package com.library.backend.dto.dashboard;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class HomepageStatsResponse {
    private long totalBooks; // Toplam Kitap Sayısı
    private long totalDigitalBooks; // Dijital Arşiv Büyüklüğü
    private Map<String, Long> categoryDistribution; // { "Bilim Kurgu": 120, "Dram": 50 }
}
package com.library.backend.controller;

import com.library.backend.dto.dashboard.AdminStatsResponse;
import com.library.backend.dto.dashboard.HomepageStatsResponse;
import com.library.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // 1. Homepage Verisi (Herkes İçin - Login olan User)
    // Eğer tamamen public (loginsiz) olsun istersen SecurityConfig'e permitAll eklemen gerekir.
    @GetMapping("/public")
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_LIBRARIAN') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<HomepageStatsResponse> getPublicStats() {
        return ResponseEntity.ok(dashboardService.getPublicStats());
    }

    // 2. Admin Verisi (Sadece Admin ve Librarian)
    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_LIBRARIAN')")
    public ResponseEntity<AdminStatsResponse> getAdminStats() {
        return ResponseEntity.ok(dashboardService.getAdminStats());
    }
}
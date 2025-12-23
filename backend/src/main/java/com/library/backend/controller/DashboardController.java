package com.library.backend.controller;

import com.library.backend.dto.dashboard.AdminStatsResponse;
import com.library.backend.dto.dashboard.HomepageStatsResponse;
import com.library.backend.dto.dashboard.LibrarianStatsResponse;
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

    // 1. Homepage Data (For logged-in users)
    @GetMapping("/public")
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_LIBRARIAN') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<HomepageStatsResponse> getPublicStats() {
        return ResponseEntity.ok(dashboardService.getPublicStats());
    }

    // 2. Admin Data (Admin and Librarian)
    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_LIBRARIAN')")
    public ResponseEntity<AdminStatsResponse> getAdminStats() {
        return ResponseEntity.ok(dashboardService.getAdminStats());
    }

    // 3. Librarian Data (Librarian only)
    @GetMapping("/librarian")
    @PreAuthorize("hasAnyRole('ROLE_LIBRARIAN', 'ROLE_ADMIN')")
    public ResponseEntity<LibrarianStatsResponse> getLibrarianStats() {
        return ResponseEntity.ok(dashboardService.getLibrarianStats());
    }
}
package com.library.backend.controller;

import com.library.backend.entity.Notification;
import com.library.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // bildirimlerimi getir
    @GetMapping
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_LIBRARIAN') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<Notification>> getMyNotifications() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(notificationService.getMyNotifications(userEmail));
    }

    // okundu yap
    @PutMapping("/{id}/read")
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_LIBRARIAN') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            notificationService.markAsRead(id, userEmail);
            return ResponseEntity.ok("Notification marked as read.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // okunmamış sayısı (frontend navbar'da kırmızı baloncuk için)
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> getUnreadCount() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(notificationService.getUnreadCount(userEmail));
    }
}
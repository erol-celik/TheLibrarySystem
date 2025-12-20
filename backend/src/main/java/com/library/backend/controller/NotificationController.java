package com.library.backend.controller;

import com.library.backend.dto.notification.NotificationResponse;
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
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_LIBRARIAN') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(notificationService.getMyNotifications(userEmail));
    }

    // okundu yap
    @PutMapping("/{id}/read")
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_LIBRARIAN') or hasAuthority('ROLE_ADMIN')")
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

    // Bildirimi sil
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_LIBRARIAN') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            notificationService.deleteNotification(id, userEmail);
            return ResponseEntity.ok("Notification deleted successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
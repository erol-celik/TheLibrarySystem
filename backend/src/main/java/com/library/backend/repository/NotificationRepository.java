package com.library.backend.repository;

import com.library.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Tüm bildirimlerini getir (Geçmişi görmek için)
    List<Notification> findByRecipientUserIdOrderByCreatedDateDesc(Long userId);
}
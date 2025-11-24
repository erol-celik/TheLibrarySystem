package com.library.backend.repository;

import com.library.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Özel Sorgu: Bir kullanıcının okunmamış bildirimlerini (Tarihe göre azalan) getir.
    List<Notification> findByRecipientUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    // Tüm bildirimlerini getir (Geçmişi görmek için)
    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(Long userId);
}
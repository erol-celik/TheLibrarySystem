package com.library.backend.service;

import com.library.backend.entity.Notification;
import com.library.backend.entity.User;
import com.library.backend.repository.NotificationRepository;
import com.library.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    // 1. bildirim gönder (email üzerinden)
    public void sendNotification(String senderEmail, String recipientEmail, String message) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Sender user not found."));

        User recipient = userRepository.findByEmail(recipientEmail)
                .orElseThrow(() -> new RuntimeException("Recipient user not found."));

        Notification notification = new Notification();
        notification.setSenderUser(sender);
        notification.setRecipientUser(recipient);
        notification.setMessage(message);
        notification.setRead(false); // yeni mesaj okunmamış olarak başlar

        notificationRepository.save(notification);
    }

    @Transactional
    // 2. bildirim gönder (id üzerinden - sistem içi tetiklemeler için)
    // örneğin: librarian onay butonuna bastığında kullanıcının emailini bilmeyebilir, id'si yeterli.
    public void sendNotificationById(Long senderId, Long recipientId, String message) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender user not found."));

        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Recipient user not found."));

        Notification notification = new Notification();
        notification.setSenderUser(sender);
        notification.setRecipientUser(recipient);
        notification.setMessage(message);
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    // 3. bildirimlerimi getir
    public List<Notification> getMyNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found."));

        // repository'de tanımladığın metodu kullanıyoruz
        return notificationRepository.findByRecipientUserIdOrderByCreatedDateDesc(user.getId());
    }

    @Transactional
    // 4. okundu olarak işaretle
    public void markAsRead(Long notificationId, String userEmail) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found."));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found."));

        // başkasının bildirimini okuyamazsın kontrolü
        if (!notification.getRecipientUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only manage your own notifications.");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    // 5. okunmamış bildirim sayısı (badge count için)
    public long getUnreadCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found."));

        // bunu repository'ye eklememiştik, stream ile sayalım veya repository'ye count metodu ekleyebiliriz.
        // performans için repository'ye eklemek daha iyi ama şimdilik stream yapalım.
        return notificationRepository.findByRecipientUserIdOrderByCreatedDateDesc(user.getId())
                .stream()
                .filter(n -> !n.isRead())
                .count();
    }
}
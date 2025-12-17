package com.library.backend.service;

import com.library.backend.entity.Notification;
import com.library.backend.entity.User;
import com.library.backend.repository.NotificationRepository;
import com.library.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.library.backend.dto.user.UserMinimalResponse;
import com.library.backend.dto.notification.NotificationResponse;
import java.util.List;
import java.util.stream.Collectors;

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
    public List<NotificationResponse> getMyNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found."));

        // 1. Entity listesini veritabanından çek
        List<Notification> notifications = notificationRepository.findByRecipientUserIdOrderByCreatedDateDesc(user.getId());

        // 2. Entity Listesini DTO Listesine Dönüştürme (Burayı soruyorsunuz)
        return notifications.stream()             // Listeyi bir akışa dönüştür
                .map(this::mapToNotificationResponse) // Akıştaki her Notification Entity'sini, yukarıdaki metodumuzla NotificationResponse DTO'suna çevir
                .collect(Collectors.toList());    // DTO'ları tekrar List<NotificationResponse> olarak topla ve döndür
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

    // 6. bildirim gönder (Recipient User nesnesi üzerinden - System Sender Varsayımı ile)
    // RentalService'deki gibi iş akışlarından kolay bildirim göndermek için.
    @Transactional
    public void sendSystemNotification(User recipient, String message) {
        // Not: Sistemin kendisini temsil eden kullanıcının ID'si (örneğin 1L) varsayılır.
        // Bu ID'nin veritabanında mevcut bir Admin/Librarian veya özel bir Sistem kullanıcısı olması gerekir.

        User sender = userRepository.findById(1L) // System/Admin Kullanıcı ID'si varsayımı
                .orElseThrow(() -> new RuntimeException("System user (ID=1) not found for notification sender."));


        Notification notification = new Notification();
        notification.setSenderUser(sender);
        notification.setRecipientUser(recipient);
        notification.setMessage(message);
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    @Transactional
    public void sendNotificationWithLink(User sender, User recipient, String message, String url) {
        Notification notification = new Notification();
        notification.setSenderUser(sender);
        notification.setRecipientUser(recipient);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setTargetUrl(url); // Linki buraya kaydediyoruz
        notificationRepository.save(notification);
    }


// NotificationService.java içinde veya bir Mapper sınıfında:

    private UserMinimalResponse mapToMinimalUserResponse(User user) {
        if (user == null) {
            return null;
        }
        // DTO oluşturma ve gerekli alanları kopyalama
        UserMinimalResponse response = new UserMinimalResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setProfipePicture(user.getAvatarUrl());
        return response;
    }

    private NotificationResponse mapToNotificationResponse(Notification notification) {
        if (notification == null) {
            return null;
        }

        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setRead(notification.isRead());
        response.setMessage(notification.getMessage());
        response.setCreatedDate(notification.getCreatedDate());
        response.setSenderUser(mapToMinimalUserResponse(notification.getSenderUser()));
        response.setRecipientUser(mapToMinimalUserResponse(notification.getRecipientUser()));

        return response;
    }


}
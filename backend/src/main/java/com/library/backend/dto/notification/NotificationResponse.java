// backend/src/main/java/com/library/backend/dto/notification/NotificationResponse.java (YENİ)
package com.library.backend.dto.notification;

import com.library.backend.dto.user.UserMinimalResponse;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Long id;
    private String message;
    private boolean isRead;
    private LocalDateTime createdDate;

    // Burası DTO'ları kullanır!
    private UserMinimalResponse recipientUser;
    private UserMinimalResponse senderUser;
}
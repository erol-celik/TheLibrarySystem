package com.library.backend.dto.social;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BadgeResponse {
    private Long id;
    private String title;
    private String description; // nasıl kazanılır?
    private String iconPath;
    private boolean isEarned; // kazanıldı mı?
    private LocalDateTime earnedDate; // ne zaman? (kazanılmadıysa null)
}
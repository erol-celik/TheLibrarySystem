package com.library.backend.service;

import com.library.backend.dto.social.BadgeResponse;
import com.library.backend.entity.Badge;
import com.library.backend.entity.User;
import com.library.backend.entity.UserBadge;
import com.library.backend.repository.BadgeRepository;
import com.library.backend.repository.UserBadgeRepository;
import com.library.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GamificationService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;

    // --- 19. rozetlerim (kazanılan ve kazanılmayanlar) ---
    public List<BadgeResponse> getUserBadgesStatus(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found."));

        // 1. sistemdeki tüm rozetleri çek
        List<Badge> allBadges = badgeRepository.findAll();

        // 2. kullanıcının kazandığı rozetleri çek
        List<UserBadge> earnedBadges = userBadgeRepository.findAllByUserId(user.getId());

        // 3. kazanılan rozetleri haritala (badgeId -> UserBadge) hızlı erişim için
        Map<Long, UserBadge> earnedMap = earnedBadges.stream()
                .collect(Collectors.toMap(ub -> ub.getBadge().getId(), ub -> ub));

        // 4. dto listesini oluştur
        return allBadges.stream().map(badge -> {
            BadgeResponse dto = new BadgeResponse();
            dto.setId(badge.getId());
            dto.setTitle(badge.getTitle());
            dto.setDescription(badge.getDescription()); // nasıl kazanılacağı burada yazar
            dto.setIconPath(badge.getIconPath());

            if (earnedMap.containsKey(badge.getId())) {
                // kazanılmış
                dto.setEarned(true);
                dto.setEarnedDate(earnedMap.get(badge.getId()).getEarnedAt());
            } else {
                // henüz kazanılmamış
                dto.setEarned(false);
                dto.setEarnedDate(null);
            }
            return dto;
        }).collect(Collectors.toList());
    }
}
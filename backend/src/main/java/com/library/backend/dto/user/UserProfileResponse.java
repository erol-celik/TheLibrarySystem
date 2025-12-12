package com.library.backend.dto.user;


import com.library.backend.entity.Badge;
import com.library.backend.entity.enums.RoleType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

@Data
public class UserProfileResponse {
    private Long id;
    private String email;
    private String name;
    private Set<RoleType> roles;
    private boolean isBanned;
    private BigDecimal walletBalance;
    String avatarUrl;
    String bio;
    Set<Badge> badges;

    public UserProfileResponse() {
    }
}

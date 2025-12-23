package com.library.backend.dto.user;

import com.library.backend.entity.enums.RoleType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class AdminUserResponse {
    private Long id;
    private String email;
    private String name;
    private Set<RoleType> role;
    private LocalDateTime joinDate;
    private boolean isBanned;
    private int penaltyCount;
}

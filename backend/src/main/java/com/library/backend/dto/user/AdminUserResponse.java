package com.library.backend.dto.user;

import com.library.backend.entity.enums.RoleType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class AdminUserResponse {
    private String email;
    private String name;
    private Set<RoleType> role;
    private LocalDateTime joinDate;
}

package com.library.backend.dto.user;

import com.library.backend.entity.enums.RoleType;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Set;

@Data
public class UserProfileUpdateRequest {
    private String profilePictureUrl;
    private String name;
    private String bio;

}

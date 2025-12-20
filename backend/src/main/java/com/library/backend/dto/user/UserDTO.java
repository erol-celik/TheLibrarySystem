package com.library.backend.dto.user;

import com.library.backend.entity.enums.RoleType;
import lombok.Data;

@Data
public class UserDTO {

    private Long id;
    private String email;
    private String name;
    private String role;
}

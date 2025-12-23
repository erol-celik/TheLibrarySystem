package com.library.backend.dto.auth;

import com.library.backend.dto.user.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    private String token; // İşte o meşhur giriş anahtarı
    private String role; // Kullanıcının rolü
    private UserDTO user; // Kullanıcının adı, emaili vs.
}
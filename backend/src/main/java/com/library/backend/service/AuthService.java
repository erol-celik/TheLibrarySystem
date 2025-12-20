package com.library.backend.service;

import com.library.backend.dto.auth.AuthResponse;
import com.library.backend.dto.auth.LoginRequest;
import com.library.backend.dto.auth.RegisterRequest;
import com.library.backend.dto.user.UserDTO;
import com.library.backend.entity.User;
import com.library.backend.entity.enums.RoleType;
import com.library.backend.repository.UserRepository;
import com.library.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        // 1. Email kontrolü
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Bu email zaten kayıtlı.");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Şifreler uyuşmuyor");
        }

        // 2. Kullanıcıyı oluştur
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.getRoles().add(RoleType.LIBRARIAN); // Varsayılan rol

        // 3. Veritabanına kaydet
        User savedUser = userRepository.save(user);

        // 4. Direkt token üret (Login çağırmaya gerek yok)
        String jwtToken = jwtService.generateToken(savedUser);

        return AuthResponse.builder()
                .token(jwtToken)
                .user(mapToDTO(savedUser))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        // 1. Kimlik Doğrulama (Spring Security)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // 2. Kullanıcıyı getir
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));

        // 3. Token üret
        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .user(mapToDTO(user))
                .build();
    }

    private UserDTO mapToDTO(User entity) {
        UserDTO dto = new UserDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setEmail(entity.getEmail());
        if (!entity.getRoles().isEmpty()) {
            dto.setRole("ROLE_" + entity.getRoles().iterator().next().name());
        }
        return dto;
    }
}
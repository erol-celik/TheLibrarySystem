package com.library.backend.service;

import com.library.backend.dto.auth.AuthResponse;
import com.library.backend.dto.auth.LoginRequest;
import com.library.backend.repository.UserRepository;
import com.library.backend.security.JwtService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final AuthenticationManager authenticationManager;
        private final JwtService jwtService;
        private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

        public AuthResponse register(com.library.backend.dto.auth.RegisterRequest request) {
                // 1. Email check
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email is already in use.");
                }

                // 2. Validate passwords
                if (!request.getPassword().equals(request.getConfirmPassword())) {
                        throw new RuntimeException("Passwords do not match.");
                }

                // 3. Create User
                com.library.backend.entity.User user = new com.library.backend.entity.User();
                user.setName(request.getName());
                user.setEmail(request.getEmail());
                user.setPassword(passwordEncoder.encode(request.getPassword()));

                java.util.Set<com.library.backend.entity.enums.RoleType> roles = new java.util.HashSet<>();
                roles.add(com.library.backend.entity.enums.RoleType.USER);
                user.setRoles(roles);

                userRepository.save(user);

                // 4. Generate Token
                var token = jwtService.generateToken(user);
                return AuthResponse.builder()
                                .token(token)
                                .role("USER")
                                .build();
        }

        public AuthResponse login(LoginRequest request) {
                System.out.println("--- [DEBUG] Login: " + request.getEmail());

                // 1. Şifre Kontrolü
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

                // 2. Kullanıcıyı Bul
                var user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("Kullanıcı yok"));

                // 3. Token Üret
                var token = jwtService.generateToken(user);

                // 4. Rolü Belirle
                String roleName = user.getRoles().isEmpty() ? "USER" : user.getRoles().iterator().next().name();

                return AuthResponse.builder()
                                .token(token)
                                .role(roleName)
                                .build();
        }
}
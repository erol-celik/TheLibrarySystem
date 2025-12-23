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

        public AuthResponse login(LoginRequest request, com.library.backend.entity.enums.RoleType expectedRole) {
                System.out.println("--- [DEBUG] Login: " + request.getEmail() + " with expected role: " + expectedRole);

                try {
                        // 1. Password verification
                        authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(request.getEmail(),
                                                        request.getPassword()));
                } catch (Exception e) {
                        System.out.println("--- [DEBUG] Authentication failed: " + e.getMessage());
                        throw new RuntimeException("Invalid email or password.");
                }

                // 2. Find user
                var user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // 3. Validate role - check if user has ANY roles first
                if (user.getRoles() == null || user.getRoles().isEmpty()) {
                        System.out.println("--- [DEBUG] User has no roles assigned: " + request.getEmail());
                        throw new org.springframework.security.access.AccessDeniedException(
                                        "Access Denied: Please use the correct login portal for your role.");
                }

                // 4. Validate that user has the expected role
                if (!user.getRoles().contains(expectedRole)) {
                        System.out.println("--- [DEBUG] Role mismatch. User roles: " + user.getRoles() + ", Expected: "
                                        + expectedRole);
                        throw new org.springframework.security.access.AccessDeniedException(
                                        "Access Denied: Please use the correct login portal for your role.");
                }

                // 5. Generate token
                var token = jwtService.generateToken(user);

                // 6. Determine role name
                String roleName = expectedRole.name();

                return AuthResponse.builder()
                                .token(token)
                                .role(roleName)
                                .build();
        }
}
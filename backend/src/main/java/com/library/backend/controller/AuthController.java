package com.library.backend.controller;

import com.library.backend.dto.auth.AuthResponse;
import com.library.backend.dto.auth.LoginRequest;
import com.library.backend.dto.auth.RegisterRequest;
import com.library.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // Role-specific login endpoints
    @PostMapping("/login/user")
    public ResponseEntity<AuthResponse> loginUser(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request, com.library.backend.entity.enums.RoleType.USER));
    }

    @PostMapping("/login/librarian")
    public ResponseEntity<AuthResponse> loginLibrarian(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request, com.library.backend.entity.enums.RoleType.LIBRARIAN));
    }

    @PostMapping("/login/admin")
    public ResponseEntity<AuthResponse> loginAdmin(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request, com.library.backend.entity.enums.RoleType.ADMIN));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }
}
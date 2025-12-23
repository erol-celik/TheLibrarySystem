package com.library.backend.controller;

import com.library.backend.dto.user.AdminUserResponse;
import com.library.backend.dto.user.UserProfileResponse;
import com.library.backend.dto.user.UserProfileUpdateRequest;
import com.library.backend.entity.User;
import com.library.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 3. GET /api/users/me
     * Giriş yapmış kullanıcının profil detaylarını (Bakiye, Rozetler vb.) döndürür.
     */
    @GetMapping("/users/me")
    @PreAuthorize("isAuthenticated()") // Sadece giriş yapmış kullanıcılar erişebilir
    public ResponseEntity<UserProfileResponse> getMyProfile(Authentication authentication) {

        // Spring Security'den aktif kullanıcının e-postasını güvenli şekilde çekiyoruz
        // (JWT Payload'ından gelir)
        String email = authentication.getName();

        UserProfileResponse profile = userService.getMyProfile(email);
        return ResponseEntity.ok(profile);
    }

    /**
     * 4. PUT /api/users/me
     * Giriş yapmış kullanıcının profilini günceller (Ad, Avatar, Bio).
     */
    @PutMapping("/users/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UserProfileUpdateRequest request) {
        String email = authentication.getName();
        UserProfileResponse updatedProfile = userService.updateMyProfile(email, request);
        return ResponseEntity.ok(updatedProfile);
    }

    /**
     * 5. POST /api/admin/ban/{userId}
     * Belirtilen kullanıcıyı yasaklar (isBanned = true yapar).
     * Erişim: Sadece ADMIN rolü
     */
    @PostMapping("admin/ban/{userId}")
    // SecurityConfig'de yaptığımız hasAuthority("ADMIN") kuralını kullanarak
    // yetkilendirme yapılır.
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> banUser(@PathVariable Long userId) {
        userService.banUser(userId);
        return ResponseEntity.ok().build(); // 200 OK döndür
    }

    /**
     * Sadece ADMIN'in erişebileceği kullanıcı listesi
     * GET /api/admin/users
     * GET /api/admin/users?isBanned=true
     */
    @GetMapping("/admin/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<AdminUserResponse>> listUsers(
            @RequestParam(required = false) Optional<Boolean> isBanned) {
        List<AdminUserResponse> users = userService.listUsers(isBanned);
        return ResponseEntity.ok(users);
    }

    /*
     * @DeleteMapping("/admin/users/{userId}")
     * 
     * @PreAuthorize("hasAuthority('ROLE_ADMIN')")
     * public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
     * userService.deleteUser(userId);
     * return ResponseEntity.noContent().build();
     * }
     */

    @PatchMapping("/admin/users/{userId}/status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> updateUserStatus(@PathVariable Long userId, @RequestParam String status) {
        userService.updateUserStatus(userId, status);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/admin/users/{userId}/penalty")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> updateUserPenalty(@PathVariable Long userId, @RequestParam int count) {
        userService.updatePenalty(userId, count);
        return ResponseEntity.ok().build();
    }
}

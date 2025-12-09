package com.library.backend.controller;

import com.library.backend.dto.auth.LoginRequest;
import com.library.backend.dto.auth.RegisterRequest;
import com.library.backend.dto.user.UserDTO;
import com.library.backend.service.AuthService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth") // Tüm endpoint'ler /api/auth ile başlar
@AllArgsConstructor
public class AuthController {

    private final AuthService authService;



    /**
     * 1. POST /api/auth/register : Yeni kullanıcı kaydı
     */
    @PostMapping("/register")
    // Başarılı kayıtta HTTP 201 Created döndürür
    public ResponseEntity<UserDTO> register(@RequestBody RegisterRequest request) {
        try {
            // İşi Service katmanına devret
            UserDTO registeredUser = authService.register(request);

            // Başarılı: 201 Created ve kullanıcı verisini döndür
            return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);

        } catch (RuntimeException e) {
            // Hata yakalama: Service'ten gelen "Email zaten kullanılıyor" gibi hatalar
            // Gerçek projede 409 Conflict döndürülür. Şimdilik 400 Bad Request kullanalım.
            // NOT: Hata mesajını body'de döndürmek için farklı bir yapı kullanmak gerekir.
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 2. POST /api/auth/login : Kullanıcı girişi
     */
    @PostMapping("/login")
    public ResponseEntity<UserDTO> login(@RequestBody LoginRequest request) {
        try {
            // İşi Service katmanına devret
            UserDTO userDto = authService.login(request);

            // Başarılı: 200 OK ve kullanıcı verisini döndür
            return ResponseEntity.ok(userDto);

        } catch (RuntimeException e) {
            // Hata yakalama: Service'ten gelen "Parola/Email hatalı" hataları
            // Giriş hatası için genellikle 401 Unauthorized veya 400 Bad Request kullanılır.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 401
        }
    }
}
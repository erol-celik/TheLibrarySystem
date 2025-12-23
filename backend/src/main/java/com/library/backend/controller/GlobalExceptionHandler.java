package com.library.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<String> handleBadCredentials() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("HATA: Şifre yanlış veya kullanıcı yok!");
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<String> handleLocked() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Access denied: Your account has been banned. Please contact the administrator.");
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<String> handleDisabled() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("HATA: Hesap aktif değil!");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneral(Exception e) {
        // Konsola gerçek hatayı bas
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("BİLİNMEYEN HATA: " + e.getMessage());
    }
}
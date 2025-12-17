package com.library.backend.controller;

import com.library.backend.dto.social.ReviewRequest;
import com.library.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SocialController {

    private final ReviewService reviewService;


    // yorum yap
    @PostMapping("/reviews")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<?> addReview(@RequestBody ReviewRequest request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            reviewService.addReview(userEmail, request);
            return ResponseEntity.ok("Review added successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // YENİ: yorum güncelle
    @PutMapping("/reviews/{id}")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<?> updateReview(@PathVariable Long id, @RequestBody ReviewRequest request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            reviewService.updateReview(userEmail, id, request);
            return ResponseEntity.ok("Review updated successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // yorum beğen
    @PostMapping("/reviews/{id}/like")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<?> likeReview(@PathVariable Long id) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            reviewService.toggleLike(userEmail, id);
            return ResponseEntity.ok("Like status updated.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
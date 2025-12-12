package com.library.backend.controller;

import com.library.backend.dto.contribution.DonationRequest;
import com.library.backend.dto.contribution.FeedbackRequest;
import com.library.backend.dto.contribution.SuggestionRequest;
import com.library.backend.entity.BookSuggestion;
import com.library.backend.entity.Donation;
import com.library.backend.entity.User;
import com.library.backend.entity.enums.BookSuggestionStatus;
import com.library.backend.service.DonationService;
import com.library.backend.service.FeedbackService;
import com.library.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ContributionController {

    private final DonationService donationService;
    private final FeedbackService feedbackService;
    private final UserRepository userRepository; // Giriş yapanın ID'sini bulmak için

    // --- DONATION ENDPOINTS ---

    @PostMapping("/donations")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<?> createDonation(@RequestBody DonationRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        donationService.createDonation(email, request);
        return ResponseEntity.ok("Donation request created.");
    }

    @GetMapping("/donations/my-history")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<List<Donation>> getMyDonations() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(donationService.getMyDonations(email));
    }

    @GetMapping("/librarian/donations/pending")
    @PreAuthorize("hasAnyRole('ROLE_LIBRARIAN', 'ROLE_ADMIN')")
    public ResponseEntity<List<Donation>> getPendingDonations() {
        return ResponseEntity.ok(donationService.getPendingDonations());
    }

    @PutMapping("/librarian/donations/{id}/process")
    @PreAuthorize("hasAnyRole('ROLE_LIBRARIAN', 'ROLE_ADMIN')")
    public ResponseEntity<?> processDonation(@PathVariable Long id, @RequestParam boolean approved, @RequestParam(required = false) String reason) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User librarian = userRepository.findByEmail(email).orElseThrow(); // İşlemi yapan kişi

        donationService.processDonation(librarian.getId(), id, approved, reason);
        return ResponseEntity.ok("Donation processed.");
    }

    // --- SUGGESTION & FEEDBACK ENDPOINTS ---

    @PostMapping("/suggestions")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<?> createSuggestion(@RequestBody SuggestionRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        feedbackService.createSuggestion(email, request);
        return ResponseEntity.ok("Suggestion sent.");
    }

    @GetMapping("/librarian/suggestions")
    @PreAuthorize("hasAnyRole('ROLE_LIBRARIAN', 'ROLE_ADMIN')")
    public ResponseEntity<List<BookSuggestion>> getPendingSuggestions() {
        return ResponseEntity.ok(feedbackService.getPendingSuggestions());
    }

    @PutMapping("/librarian/suggestions/{id}/status")
    @PreAuthorize("hasAnyRole('ROLE_LIBRARIAN', 'ROLE_ADMIN')")
    public ResponseEntity<?> updateSuggestionStatus(@PathVariable Long id, @RequestParam BookSuggestionStatus status) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User librarian = userRepository.findByEmail(email).orElseThrow();

        feedbackService.updateSuggestionStatus(librarian.getId(), id, status);
        return ResponseEntity.ok("Status updated.");
    }

    @PostMapping("/feedback")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<?> createFeedback(@RequestBody FeedbackRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        feedbackService.createFeedback(email, request);
        return ResponseEntity.ok("Feedback sent.");
    }

    // Admin feedback çözme endpoint'i de eklenebilir...
}
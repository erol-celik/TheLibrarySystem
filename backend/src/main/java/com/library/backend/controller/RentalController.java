package com.library.backend.controller;

import com.library.backend.dto.rental.RentRequest;
import com.library.backend.dto.rental.RentalResponse; // Yeni DTO importu
import com.library.backend.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RentalController {

    private final RentalService rentalService;

    // --- 12. ENDPOINT: KİTAP KİRALA (Sadece USER) ---
    @PostMapping("/rentals")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<?> rentBook(@RequestBody RentRequest request) {
        // Token'dan email bilgisini al
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        try {
            // Değişiklik: Artık Entity değil DTO (RentalResponse) dönüyoruz.
            // Bu sayede iç içe sonsuz döngü (recursion) sorunu çözüldü.
            RentalResponse response = rentalService.rentBook(userEmail, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- 13. ENDPOINT: İADE AL (Sadece LIBRARIAN veya ADMIN) ---
    @PostMapping("/rentals/{id}/return")
    @PreAuthorize("hasAuthority('ROLE_LIBRARIAN')")
    public ResponseEntity<?> returnBook(@PathVariable Long id) {
        try {
            // Değişiklik: Burada da DTO dönüyoruz.
            RentalResponse response = rentalService.returnBook(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- 16. ENDPOINT: KİRALAMA GEÇMİŞİNİ GÖRÜNTÜLE (Sadece USER) ---
    @GetMapping("/users/book-history")
    @PreAuthorize("hasAuthority('ROLE_USER')")
    public ResponseEntity<List<RentalResponse>> getRentalHistory() {
        // Token'dan email bilgisini al
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        List<RentalResponse> history = rentalService.getRentalHistoryByUserEmail(userEmail);
        return ResponseEntity.ok(history);
    }

    // --- 17. ENDPOINT: KİRALAMA TALEBİNİ ONAYLA (Sadece LIBRARIAN) ---
    @PostMapping("/rentals/approve/{id}")
    @PreAuthorize("hasAuthority('ROLE_LIBRARIAN')")
    public ResponseEntity<RentalResponse> approveRental(@PathVariable Long id) {
        RentalResponse response = rentalService.approveRentalRequest(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/rentals/requests") // App.tsx'den çağırdığımız adres
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LIBRARIAN')")
    public ResponseEntity<List<RentalResponse>> getAllRequests() {
        return ResponseEntity.ok(rentalService.showAllRentalRequest());
    }
}
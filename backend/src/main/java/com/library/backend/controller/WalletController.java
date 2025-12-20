package com.library.backend.controller;

import com.library.backend.entity.WalletTransaction;
import com.library.backend.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @PostMapping("/deposit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BigDecimal> depositFunds(Authentication authentication,
            @RequestBody Map<String, BigDecimal> payload) {
        String email = authentication.getName();
        BigDecimal amount = payload.get("amount");
        BigDecimal newBalance = walletService.depositFunds(email, amount);
        return ResponseEntity.ok(newBalance);
    }

    @GetMapping("/balance")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BigDecimal> getBalance(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(walletService.getBalance(email));
    }

    @GetMapping("/transactions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<WalletTransaction>> getTransactions(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(walletService.getTransactions(email));
    }
}

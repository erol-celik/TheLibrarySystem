package com.library.backend.service;

import com.library.backend.entity.User;
import com.library.backend.entity.Wallet;
import com.library.backend.entity.WalletTransaction;
import com.library.backend.entity.enums.TransactionType;
import com.library.backend.repository.UserRepository;
import com.library.backend.repository.WalletRepository;
import com.library.backend.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // 1. Deposit funds (User action)
    @Transactional
    public BigDecimal depositFunds(String userEmail, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Deposit amount must be greater than 0.");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found."));

        Wallet wallet = walletRepository.findByUser(user)
                .orElseGet(() -> createWalletForUser(user)); // Cüzdan yoksa oluştur

        // Bakiyeyi artır
        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);
        userRepository.save(user);
        // Log at (Dekont)
        saveTransaction(wallet, TransactionType.DEPOSIT, amount, null);

        // Notify User
        String userMsg = String.format("Successfully deposited $%s to your wallet. Current balance: $%s.", amount,
                wallet.getBalance());
        notificationService.sendSystemNotification(user, userMsg);

        // Notify Admin
        String adminMsg = String.format("A deposit of $%s was made by user %s.", amount, user.getEmail());
        notificationService.sendNotificationToRole(com.library.backend.entity.enums.RoleType.ADMIN, adminMsg);

        return wallet.getBalance();
    }

    // 2. Withdraw funds (System action - called by Rental Service)
    @Transactional
    public void withdrawFunds(User user, BigDecimal amount) {
        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Wallet not found."));

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient Balance! Please add funds to your wallet.");
        }

        // Deduct balance
        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        // Transaction logging is done in RentalService based on transaction type
    }

    // Helper: Transaction Record
    public void saveTransaction(Wallet wallet, TransactionType type, BigDecimal amount, Long relatedId) {
        WalletTransaction trx = new WalletTransaction();
        trx.setWallet(wallet);
        trx.setTransactionType(type);
        trx.setAmount(amount);
        trx.setRelatedEntityId(relatedId);
        transactionRepository.save(trx);

        // Notify User of transaction (unless it's a deposit which is handled
        // separately)
        if (type != TransactionType.DEPOSIT) {
            String message = String.format("Transaction alert: %s of $%s recorded.", type.name(), amount);
            notificationService.sendSystemNotification(wallet.getUser(), message);
        }
    }

    // Helper: Create Wallet
    private Wallet createWalletForUser(User user) {
        Wallet wallet = new Wallet();
        wallet.setUser(user);
        wallet.setBalance(BigDecimal.ZERO);
        return walletRepository.save(wallet);
    }

    // Get user balance
    public BigDecimal getBalance(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return walletRepository.findByUser(user)
                .map(Wallet::getBalance)
                .orElse(BigDecimal.ZERO);
    }

    // 4. Get user transaction history
    public List<WalletTransaction> getTransactions(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        // If wallet doesn't exist, return empty list instead of error
        // A missing wallet simply means no transactions have occurred yet
        return walletRepository.findByUser(user)
                .map(wallet -> transactionRepository.findByWalletIdOrderByCreatedDateDesc(wallet.getId()))
                .orElse(java.util.Collections.emptyList());
    }
}
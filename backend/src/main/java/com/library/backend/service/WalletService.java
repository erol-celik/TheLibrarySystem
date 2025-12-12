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

    // 1. Para Yükleme (Kullanıcı yapar)
    @Transactional
    public BigDecimal depositFunds(String userEmail, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Yüklenecek miktar 0'dan büyük olmalı.");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));

        Wallet wallet = walletRepository.findByUser(user)
                .orElseGet(() -> createWalletForUser(user)); // Cüzdan yoksa oluştur

        // Bakiyeyi artır
        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);

        // Log at (Dekont)
        saveTransaction(wallet, TransactionType.PURCHASE, amount, null); // PURCHASE yerine DEPOSIT olmalıydı ama enum'da yoksa PURCHASE kullanıyorum şimdilik.

        return wallet.getBalance();
    }

    // 2. Para Çekme (Sistem yapar - Kiralama Servisi çağırır)
    @Transactional
    public void withdrawFunds(User user, BigDecimal amount) {
        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cüzdan bulunamadı."));

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Yetersiz Bakiye! Lütfen cüzdanınıza para yükleyin.");
        }

        // Bakiyeyi düş
        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        // Loglama işlemi RentalService içinde transaction tipine göre yapılacak
    }

    // Yardımcı: Transaction Kaydı
    public void saveTransaction(Wallet wallet, TransactionType type, BigDecimal amount, Long relatedId) {
        WalletTransaction trx = new WalletTransaction();
        trx.setWallet(wallet);
        trx.setTransactionType(type);
        trx.setAmount(amount);
        trx.setRelatedEntityId(relatedId);
        transactionRepository.save(trx);
    }

    // Yardımcı: Cüzdan Oluşturma
    private Wallet createWalletForUser(User user) {
        Wallet wallet = new Wallet();
        wallet.setUser(user);
        wallet.setBalance(BigDecimal.ZERO);
        return walletRepository.save(wallet);
    }

    // Kullanıcının bakiyesini getir
    public BigDecimal getBalance(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return walletRepository.findByUser(user)
                .map(Wallet::getBalance)
                .orElse(BigDecimal.ZERO);
    }
}
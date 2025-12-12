package com.library.backend.repository;

import com.library.backend.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    // Bir cüzdana ait tüm işlemleri getir (Yeniden eskiye doğru sıralı)
    // Bu metod ileride "Cüzdan Geçmişi" sayfasında çok işimize yarayacak.
    List<WalletTransaction> findByWalletIdOrderByCreatedDateDesc(Long walletId);

    // DEPOSIT (Yükleme) veya PURCHASE (Satın Alma) tipindeki işlemlerin toplamı = Ciro
    @org.springframework.data.jpa.repository.Query("SELECT SUM(w.amount) FROM WalletTransaction w WHERE w.transactionType = 'DEPOSIT'")
    java.math.BigDecimal calculateTotalRevenue();
}
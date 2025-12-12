package com.library.backend.repository;

import com.library.backend.entity.Rental;
import com.library.backend.entity.enums.RentalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RentalRepository extends JpaRepository<Rental, Long> {

    // kullanıcının tüm geçmişi
    List<Rental> findByUserId(Long userId);

    // aktif kiralamalar (liste lazım olursa)
    List<Rental> findByUserIdAndStatus(Long userId, RentalStatus status);

    // aktif kiralama var mı kontrolü (performans için count sorgusu atar)
    boolean existsByUserIdAndStatus(Long userId, RentalStatus status);

    boolean existsByUserIdAndBookId(Long userId, Long bookId);

    // 1. Şu an dışarıda olan (henüz iade edilmemiş) kitap sayısı
    long countByStatus(com.library.backend.entity.enums.RentalStatus status);

    // 2. Teslim tarihi geçmiş (Due Date < Bugün) VE hala iade edilmemiş (APPROVED) kitaplar
    @org.springframework.data.jpa.repository.Query("SELECT r FROM Rental r WHERE r.dueDate < CURRENT_DATE AND r.status = 'APPROVED'")
    List<Rental> findOverdueRentals();
}

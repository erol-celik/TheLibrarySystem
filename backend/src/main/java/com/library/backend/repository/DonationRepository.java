package com.library.backend.repository;

import com.library.backend.entity.Donation;
import com.library.backend.entity.enums.DonationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DonationRepository extends JpaRepository<Donation, Long> {

    // Admin için: Sadece 'PENDING' olanları getir (Onaylanacaklar listesi)
    List<Donation> findByStatus(DonationStatus status);

    // Kullanıcı için: Benim yaptığım bağışları getir
    List<Donation> findByUserId(Long userId);
}
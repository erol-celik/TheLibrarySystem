package com.library.backend.repository;

import com.library.backend.entity.Rental;
import com.library.backend.entity.enums.RentalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RentalRepository extends JpaRepository<Rental, Long> {

    // Bir kullanıcının tüm kiralama geçmişini getir
    List<Rental> findByUserId(Long userId);

    // Bir kullanıcının sadece AKTİF (iade edilmemiş) kiralamalarını getir
    // (Kullanıcı aynı anda en fazla 3 kitap alabilir kuralı için lazım olacak)
    List<Rental> findByUserIdAndStatus(Long userId, RentalStatus status);
}
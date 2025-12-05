package com.library.backend.repository;

import com.library.backend.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BadgeRepository extends JpaRepository<Badge, Long> {

    // Rozetleri benzersiz isimlerine göre (Örn: "KITAP_KURDU") çekmek için
    Optional<Badge> findByName(String name);
}
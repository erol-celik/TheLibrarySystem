package com.library.backend.repository;

import com.library.backend.entity.Donation;
import com.library.backend.entity.enums.DonationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDateTime;

public interface DonationRepository extends JpaRepository<Donation, Long> {

    // Get donations by status (for pending list)
    List<Donation> findByStatus(DonationStatus status);

    // Count donations by status
    long countByStatus(DonationStatus status);

    // Get donations by user
    List<Donation> findByUserId(Long userId);

    // Check if user already donated a book with this title
    boolean existsByUserIdAndBookTitleIgnoreCase(Long userId, String bookTitle);

    // Count donations created after a specific date
    long countByCreatedDateAfter(LocalDateTime date);
}
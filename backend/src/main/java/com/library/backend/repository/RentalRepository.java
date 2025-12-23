package com.library.backend.repository;

import com.library.backend.entity.Rental;
import com.library.backend.entity.enums.RentalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RentalRepository extends JpaRepository<Rental, Long> {

    // User's rental history
    List<Rental> findByUserId(Long userId);

    // Active rentals for a user (list)
    List<Rental> findByUserIdAndStatus(Long userId, RentalStatus status);

    // Check if user has active rental (performance: uses count query)
    boolean existsByUserIdAndStatus(Long userId, RentalStatus status);

    boolean existsByUserIdAndBookId(Long userId, Long bookId);

    // Count currently borrowed books (not yet returned)
    long countByStatus(RentalStatus status);

    // Overdue rentals (Due Date < Today AND status is APPROVED)
    @org.springframework.data.jpa.repository.Query("SELECT r FROM Rental r WHERE r.dueDate < CURRENT_DATE AND r.status = 'APPROVED'")
    List<Rental> findOverdueRentals();

    List<Rental> findAllByStatus(RentalStatus status);

    // User-specific statistics
    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, RentalStatus status);
}

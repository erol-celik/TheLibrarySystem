package com.library.backend.service;

import com.library.backend.dto.rental.RentRequest;
import com.library.backend.dto.rental.RentalResponse;
import com.library.backend.dto.user.UserMinimalResponse;
import com.library.backend.entity.Book;
import com.library.backend.entity.Rental;
import com.library.backend.entity.User;
import com.library.backend.entity.Wallet;
import com.library.backend.entity.enums.RentalStatus;
import com.library.backend.entity.enums.TransactionType;
import com.library.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final WalletRepository walletRepository;
    private final NotificationService notificationService;

    // Rule: maximum rental period is 14 days
    private static final int RENTAL_PERIOD_DAYS = 14;
    // Rule: daily late fee
    private static final BigDecimal DAILY_PENALTY_RATE = BigDecimal.valueOf(5.00);

    @Transactional
    // --- 1. Rental operation (physical books only) ---
    public RentalResponse rentBook(String userEmail, RentRequest request) {
        // Find user and book
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found."));

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found."));

        // Validations and rules

        // Rule: digital books cannot be rented
        if (book.getBookType() == com.library.backend.entity.enums.BookType.DIGITAL) {
            throw new RuntimeException("Digital books cannot be rented, only purchased.");
        }

        // Rule: banned user check
        if (user.isBanned()) {
            throw new RuntimeException("Account suspended. Rental not allowed.");
        }

        // Rule: stock check (for request)
        if (book.getAvailableStock() <= 0) {
            // Note: Could make REQUESTED even with zero stock, librarian decides.
            // But keep current rule: stock required even for request.
            throw new RuntimeException("Book is out of stock.");
        }

        // Rule: single book limit (only check APPROVED or REQUESTED records)
        // Does user have an approved (APPROVED) or pending (REQUESTED) book?
        // NOTE: RentalRepository only checks APPROVED. Could add REQUESTED check too.
        // For now, continue with APPROVED check only.
        boolean hasActiveRental = rentalRepository.existsByUserIdAndStatus(user.getId(), RentalStatus.APPROVED);

        if (hasActiveRental) {
            throw new RuntimeException("You can only rent 1 book at a time. Please return your current book first.");
        }

        // **!!! STOCK OPERATIONS REMOVED FROM HERE !!!** (Moved to approval method)

        // Create rental record
        Rental rental = new Rental();
        rental.setUser(user);
        rental.setBook(book);

        // Set status to REQUESTED
        rental.setStatus(RentalStatus.REQUESTED);

        // Note: RentDate and DueDate will be set on approval.
        // Set placeholder dates here since entity requires non-null.
        rental.setRentDate(LocalDate.now());
        rental.setDueDate(LocalDate.now().plusDays(RENTAL_PERIOD_DAYS));

        Rental savedRental = rentalRepository.save(rental);

        // Notify Librarians
        String message = String.format("A new borrow request for '%s' has been received from %s.", book.getTitle(),
                user.getName());
        notificationService.sendNotificationToRole(com.library.backend.entity.enums.RoleType.LIBRARIAN, message);

        return mapToResponse(savedRental);
    }

    @Transactional
    public List<RentalResponse> showAllRentalRequest() {
        List<Rental> rentalList = rentalRepository.findAllByStatus(RentalStatus.REQUESTED);
        return rentalList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    // --- 4. Approve Rental Request (Librarian/Admin action) ---
    public RentalResponse approveRentalRequest(Long rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Rental request not found."));

        // Only REQUESTED status rentals can be approved
        if (rental.getStatus() != RentalStatus.REQUESTED) {
            throw new RuntimeException("Only REQUESTED rentals can be approved. Current status: " + rental.getStatus());
        }

        // 1. Stock check (possible stock depletion)
        Book book = rental.getBook();
        if (book.getAvailableStock() <= 0) {
            // Stock depleted at approval stage
            throw new RuntimeException("Book is out of stock. Cannot approve rental.");
        }

        // 2. Reduce stock
        book.setAvailableStock(book.getAvailableStock() - 1);
        bookRepository.save(book);

        // 3. Update rental record
        rental.setStatus(RentalStatus.APPROVED);

        // Set actual rent date and due date at approval time (not request time)
        rental.setRentDate(LocalDate.now());
        rental.setDueDate(LocalDate.now().plusDays(RENTAL_PERIOD_DAYS));
        String message = String.format("Your rental has been approved! Book: %s. Due date: %s",
                rental.getBook().getTitle(),
                rental.getDueDate());

        notificationService.sendSystemNotification(rental.getUser(), message);

        Rental savedRental = rentalRepository.save(rental);
        return mapToResponse(savedRental);
    }

    @Transactional
    // --- 5. Reject Rental Request (Librarian/Admin action) ---
    public RentalResponse rejectRentalRequest(Long rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Rental request not found."));

        if (rental.getStatus() != RentalStatus.REQUESTED) {
            throw new RuntimeException("Only REQUESTED rentals can be rejected. Current status: " + rental.getStatus());
        }

        rental.setStatus(RentalStatus.REJECTED);

        String message = String.format("Unfortunately, your rental request has been rejected. Book: %s.",
                rental.getBook().getTitle());

        notificationService.sendSystemNotification(rental.getUser(), message);

        Rental savedRental = rentalRepository.save(rental);
        return mapToResponse(savedRental);
    }

    public List<RentalResponse> getRentalHistoryByUserEmail(String userEmail) {
        // 1. Find user by email
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found."));

        // 2. Get all rental records for user
        List<Rental> rentals = rentalRepository.findByUserId(user.getId());

        // 3. Map list to RentalResponse DTOs and return
        return rentals.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    // --- 2. Return operation (librarian/admin action) ---
    public RentalResponse returnBook(Long rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Rental record not found."));

        // Already returned check
        if (rental.getStatus() == RentalStatus.RETURNED) {
            throw new RuntimeException("Book is already returned.");
        }

        // Late penalty calculation
        LocalDate today = LocalDate.now();
        BigDecimal penalty = BigDecimal.ZERO;

        if (today.isAfter(rental.getDueDate())) {
            long daysLate = ChronoUnit.DAYS.between(rental.getDueDate(), today);
            if (daysLate > 0) {
                penalty = DAILY_PENALTY_RATE.multiply(BigDecimal.valueOf(daysLate));

                // Deduct penalty from wallet
                Wallet wallet = walletRepository.findByUser(rental.getUser())
                        .orElseThrow(() -> new RuntimeException("User wallet not found."));

                wallet.setBalance(wallet.getBalance().subtract(penalty));
                walletRepository.save(wallet);

                // Create transaction log
                walletService.saveTransaction(wallet, TransactionType.PENALTY_PAYMENT, penalty,
                        rental.getBook().getId());
            }
        }

        // Update rental record
        rental.setReturnDate(today);
        rental.setStatus(RentalStatus.RETURNED);
        rental.setPenaltyFee(penalty);

        // Increase stock
        Book book = rental.getBook();
        book.setAvailableStock(book.getAvailableStock() + 1);
        bookRepository.save(book);

        // Gamification integration (to be added later)

        Rental savedRental = rentalRepository.save(rental);
        return mapToResponse(savedRental);
    }

    @Transactional
    public RentalResponse userReturnBook(String userEmail, Long rentalId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found."));

        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Rental record not found."));

        // Ownership check
        if (!rental.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to return this book.");
        }

        // Status validation - only APPROVED or LATE books can be returned
        if (rental.getStatus() == RentalStatus.RETURNED) {
            throw new RuntimeException("This book has already been returned.");
        }
        if (rental.getStatus() == RentalStatus.RETURN_PENDING) {
            throw new RuntimeException("A return request is already pending for this book.");
        }
        if (rental.getStatus() == RentalStatus.REQUESTED) {
            throw new RuntimeException("Cannot return a book that hasn't been approved yet.");
        }
        if (rental.getStatus() == RentalStatus.REJECTED) {
            throw new RuntimeException("Cannot return a rejected rental request.");
        }
        if (rental.getStatus() != RentalStatus.APPROVED && rental.getStatus() != RentalStatus.LATE) {
            throw new RuntimeException("This rental cannot be returned. Current status: " + rental.getStatus());
        }

        // Set status to RETURN_PENDING instead of immediate return
        rental.setStatus(RentalStatus.RETURN_PENDING);
        rentalRepository.save(rental);

        // Notify librarians about pending return
        String message = String.format("Return request received from %s for book: %s",
                user.getName(), rental.getBook().getTitle());
        notificationService.sendNotificationToRole(com.library.backend.entity.enums.RoleType.LIBRARIAN, message);

        return mapToResponse(rental);
    }

    @Transactional
    // --- 6. Approve Return (Librarian/Admin action) ---
    public RentalResponse approveReturn(Long rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Rental record not found."));

        // Only RETURN_PENDING rentals can be approved for return
        if (rental.getStatus() != RentalStatus.RETURN_PENDING) {
            throw new RuntimeException(
                    "Only RETURN_PENDING rentals can be approved for return. Current status: " + rental.getStatus());
        }

        // Calculate late penalty if applicable
        LocalDate today = LocalDate.now();
        BigDecimal penalty = BigDecimal.ZERO;

        if (rental.getDueDate() != null) {
            long daysLate = java.time.temporal.ChronoUnit.DAYS.between(rental.getDueDate(), today);
            if (daysLate > 0) {
                penalty = DAILY_PENALTY_RATE.multiply(BigDecimal.valueOf(daysLate));

                // Deduct penalty from wallet
                Wallet wallet = walletRepository.findByUser(rental.getUser())
                        .orElseThrow(() -> new RuntimeException("User wallet not found."));

                wallet.setBalance(wallet.getBalance().subtract(penalty));
                walletRepository.save(wallet);

                // Create transaction log
                walletService.saveTransaction(wallet, TransactionType.PENALTY_PAYMENT, penalty,
                        rental.getBook().getId());
            }
        }

        // Update rental record
        rental.setReturnDate(today);
        rental.setStatus(RentalStatus.RETURNED);
        rental.setPenaltyFee(penalty);

        // Increase stock
        Book book = rental.getBook();
        book.setAvailableStock(book.getAvailableStock() + 1);
        bookRepository.save(book);

        // Notify user
        String message = String.format("Your return for '%s' has been approved.", rental.getBook().getTitle());
        notificationService.sendSystemNotification(rental.getUser(), message);

        Rental savedRental = rentalRepository.save(rental);
        return mapToResponse(savedRental);
    }

    private RentalResponse mapToResponse(Rental rental) {
        RentalResponse response = new RentalResponse();
        response.setId(rental.getId());
        response.setRentDate(rental.getRentDate());
        response.setDueDate(rental.getDueDate());
        response.setReturnDate(rental.getReturnDate());
        response.setStatus(rental.getStatus());
        response.setPenaltyFee(rental.getPenaltyFee());

        if (rental.getBook() != null) {
            response.setBookId(rental.getBook().getId());
            response.setBookTitle(rental.getBook().getTitle());
            response.setBookAuthor(rental.getBook().getAuthor());
            response.setBookImage(rental.getBook().getImageUrl());
        }

        if (rental.getUser() != null) {
            response.setUserId(rental.getUser().getId());
            response.setUserName(rental.getUser().getName());
        }

        return response;
    }

}
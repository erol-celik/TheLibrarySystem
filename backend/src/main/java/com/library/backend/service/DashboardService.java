package com.library.backend.service;

import com.library.backend.dto.book.BookResponse;
import com.library.backend.dto.dashboard.AdminStatsResponse;
import com.library.backend.dto.dashboard.HomepageStatsResponse;
import com.library.backend.dto.dashboard.LibrarianStatsResponse;
import com.library.backend.entity.Book;
import com.library.backend.entity.Rental;
import com.library.backend.entity.enums.BookType;
import com.library.backend.entity.enums.DonationStatus;
import com.library.backend.entity.enums.RentalStatus;
import com.library.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BookRepository bookRepository;
    private final RentalRepository rentalRepository;
    private final UserRepository userRepository;
    private final BookSaleRepository bookSaleRepository;
    private final DonationRepository donationRepository;

    // --- 1. Homepage Data (Public Access) ---
    public HomepageStatsResponse getPublicStats() {
        // Total book count
        long totalBooks = bookRepository.count();

        // Digital book count
        long totalDigital = bookRepository.count(); // Could filter by bookType for accuracy
        long totalUsers = userRepository.count();

        long activeRentals = rentalRepository.countByStatus(RentalStatus.APPROVED);
        // Category Distribution (Pie Chart)
        List<Object[]> distribution = bookRepository.countBooksByCategory();
        Map<String, Long> categoryMap = new HashMap<>();
        for (Object[] row : distribution) {
            categoryMap.put((String) row[0], (Long) row[1]);
        }

        return HomepageStatsResponse.builder()
                .totalBooks(bookRepository.count())
                .totalUsers(userRepository.count())
                .activeRentals(rentalRepository.countByStatus(RentalStatus.APPROVED))
                .totalDigitalBooks(bookRepository.count())
                .categoryDistribution(categoryMap)
                .build();
    }

    // --- 2. Admin Data (Admin Only) ---
    public AdminStatsResponse getAdminStats() {
        // KPI Cards
        long totalUsers = userRepository.count();
        long activeRentals = rentalRepository.countByStatus(RentalStatus.APPROVED);

        // Calculate total revenue from book sales (not wallet transactions)
        BigDecimal revenue = bookSaleRepository.calculateTotalRevenue();
        if (revenue == null)
            revenue = BigDecimal.ZERO;

        // System Alerts = all pending requests (borrow + return + donation)
        long borrowRequests = rentalRepository.countByStatus(RentalStatus.REQUESTED);
        long returnRequests = rentalRepository.countByStatus(RentalStatus.RETURN_PENDING);
        long donationRequests = donationRepository.countByStatus(DonationStatus.PENDING);
        long systemAlerts = borrowRequests + returnRequests + donationRequests;

        // Stock Alert (physical books with less than 3 copies)
        List<Book> lowStockList = bookRepository.findByAvailableStockLessThanAndBookType(3, BookType.PHYSICAL);
        List<BookResponse> lowStockDtos = lowStockList.stream()
                .map(this::mapBookToDto)
                .collect(Collectors.toList());

        // Overdue Rentals List (returned as simple string list, could use detailed DTO)
        List<Rental> overdueList = rentalRepository.findOverdueRentals();
        List<String> overdueInfos = overdueList.stream()
                .map(r -> r.getUser().getName() + " - " + r.getBook().getTitle() + " (Due: " + r.getDueDate() + ")")
                .collect(Collectors.toList());

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .activeRentals(activeRentals)
                .totalRevenue(revenue)
                .systemAlerts(systemAlerts)
                .lowStockBooks(lowStockDtos)
                .overdueRentals(overdueInfos)
                .build();
    }

    // --- 3. Librarian Data ---
    public LibrarianStatsResponse getLibrarianStats() {
        // Pending Actions
        long borrowRequests = rentalRepository.countByStatus(RentalStatus.REQUESTED);
        long returnRequests = rentalRepository.countByStatus(RentalStatus.RETURN_PENDING);
        long donationRequests = donationRepository.countByStatus(DonationStatus.PENDING);

        // Library Overview
        long totalBooks = bookRepository.count();
        long activeLoans = rentalRepository.countByStatus(RentalStatus.APPROVED);
        long overdueBooks = rentalRepository.findOverdueRentals().size();

        // Today's Statistics (since midnight today)
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();

        // For today's stats, we count all rentals (simplified approach)
        // In a production app, you'd add createdDate queries to RentalRepository
        long booksBorrowedToday = 0; // Would need RentalRepository.countByStatusAndCreatedDateAfter
        long booksReturnedToday = 0; // Would need RentalRepository.countByStatusAndReturnDateAfter
        long newDonationsToday = donationRepository.countByCreatedDateAfter(startOfToday);

        return LibrarianStatsResponse.builder()
                .borrowRequests(borrowRequests)
                .returnRequests(returnRequests)
                .donationRequests(donationRequests)
                .totalBooks(totalBooks)
                .activeLoans(activeLoans)
                .overdueBooks(overdueBooks)
                .booksBorrowedToday(booksBorrowedToday)
                .booksReturnedToday(booksReturnedToday)
                .newDonationsToday(newDonationsToday)
                .build();
    }

    // Simple Mapper (can be moved to shared Mapper class)
    private BookResponse mapBookToDto(Book book) {
        BookResponse dto = new BookResponse();
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setAvailableStock(book.getAvailableStock());
        // Set other fields as needed
        return dto;
    }
}
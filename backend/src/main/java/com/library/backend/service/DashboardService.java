package com.library.backend.service;

import com.library.backend.dto.book.BookResponse;
import com.library.backend.dto.dashboard.AdminStatsResponse;
import com.library.backend.dto.dashboard.HomepageStatsResponse;
import com.library.backend.entity.Book;
import com.library.backend.entity.Rental;
import com.library.backend.entity.enums.BookType;
import com.library.backend.entity.enums.RentalStatus;
import com.library.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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
    private final WalletTransactionRepository transactionRepository;

    // --- 1. Homepage Verileri (Herkes Görebilir) ---
    public HomepageStatsResponse getPublicStats() {
        // Toplam kitap sayısı
        long totalBooks = bookRepository.count();

        // Dijital kitap sayısı
        long totalDigital = bookRepository.count(); // Bunu bookType ile filtrelemek daha doğru olur ama şimdilik count.
        // Doğrusu: bookRepository.findByBookType(BookType.DIGITAL).size(); (Repository'e ekleyebilirsin)
        long totalUsers = userRepository.count();

        long activeRentals = rentalRepository.countByStatus(com.library.backend.entity.enums.RentalStatus.APPROVED);
        // Kategori Dağılımı (Pie Chart)
        List<Object[]> distribution = bookRepository.countBooksByCategory();
        Map<String, Long> categoryMap = new HashMap<>();
        for (Object[] row : distribution) {
            categoryMap.put((String) row[0], (Long) row[1]);
        }

        return HomepageStatsResponse.builder()
                .totalBooks(bookRepository.count())
                .totalUsers(userRepository.count()) // Veritabanından üye sayısını çek
                .activeRentals(rentalRepository.countByStatus(com.library.backend.entity.enums.RentalStatus.APPROVED)) // Ödünç sayısını çek
                .totalDigitalBooks(bookRepository.count()) // Filtreleme eklenebilir
                .categoryDistribution(categoryMap)
                .build();
    }

    // --- 2. Admin Verileri (Sadece Patron) ---
    public AdminStatsResponse getAdminStats() {
        // KPI Kartları
        long totalUsers = userRepository.count();
        long activeRentals = rentalRepository.countByStatus(RentalStatus.APPROVED);
        BigDecimal revenue = transactionRepository.calculateTotalRevenue();
        if (revenue == null) revenue = BigDecimal.ZERO;

        // Stok Alarmı (3'ten az kalan fiziksel kitaplar)
        List<Book> lowStockList = bookRepository.findByAvailableStockLessThanAndBookType(3, BookType.PHYSICAL);
        List<BookResponse> lowStockDtos = lowStockList.stream()
                .map(this::mapBookToDto) // Aşağıdaki yardımcı metodu kullanır
                .collect(Collectors.toList());

        // Gecikenler Listesi (Basit String listesi olarak dönüyorum, detaylı DTO da olabilir)
        List<Rental> overdueList = rentalRepository.findOverdueRentals();
        List<String> overdueInfos = overdueList.stream()
                .map(r -> r.getUser().getName() + " - " + r.getBook().getTitle() + " (Due: " + r.getDueDate() + ")")
                .collect(Collectors.toList());

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .activeRentals(activeRentals)
                .totalRevenue(revenue)
                .lowStockBooks(lowStockDtos)
                .overdueRentals(overdueInfos)
                .build();
    }

    // Basit Mapper (BookService'den kopyalanabilir veya ortak bir Mapper sınıfına alınabilir)
    private BookResponse mapBookToDto(Book book) {
        BookResponse dto = new BookResponse();
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setAvailableStock(book.getAvailableStock());
        // diğer alanlar gerekirse setlenir
        return dto;
    }
}
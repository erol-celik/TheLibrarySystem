package com.library.backend.service;

import com.library.backend.dto.rental.RentRequest;
import com.library.backend.dto.rental.RentalResponse;
import com.library.backend.entity.Book;
import com.library.backend.entity.Rental;
import com.library.backend.entity.User;
import com.library.backend.entity.Wallet;
import com.library.backend.entity.enums.RentalStatus;
import com.library.backend.entity.enums.TransactionType;
import com.library.backend.repository.BookRepository;
import com.library.backend.repository.RentalRepository;
import com.library.backend.repository.UserRepository;
import com.library.backend.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final WalletRepository walletRepository;

    // kural: maksimum kiralama süresi 14 gün
    private static final int RENTAL_PERIOD_DAYS = 14;
    // kural: günlük gecikme bedeli
    private static final BigDecimal DAILY_PENALTY_RATE = BigDecimal.valueOf(5.00);

    @Transactional
    // --- 1. kiralama işlemi (sadece fiziksel kitaplar) ---
    public RentalResponse rentBook(String userEmail, RentRequest request) {
        // kullanıcı ve kitap bulma
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found."));

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found."));

        // validasyonlar ve kurallar

        // kural: dijital kitaplar kiralanamaz
        if (book.getBookType() == com.library.backend.entity.enums.BookType.DIGITAL) {
            throw new RuntimeException("Digital books cannot be rented, only purchased.");
        }

        // kural: banlı kullanıcı kontrolü
        if (user.isBanned()) {
            throw new RuntimeException("Account suspended. Rental not allowed.");
        }

        // kural: stok kontrolü
        if (book.getAvailableStock() <= 0) {
            throw new RuntimeException("Book is out of stock.");
        }

        // kural: tek kitap limiti (boolean kontrolü - performanslı)
        // kullanıcının elinde onaylı (iade edilmemiş) kitap var mı?
        boolean hasActiveRental = rentalRepository.existsByUserIdAndStatus(user.getId(), RentalStatus.APPROVED);

        if (hasActiveRental) {
            throw new RuntimeException("You can only rent 1 book at a time. Please return your current book first.");
        }

        // not: zaten kitap varsa hata fırlattığımız için "aynı kitabı kiraladı mı" kontrolüne gerek kalmadı.

        // stok işlemleri

        // stoğu 1 azalt
        book.setAvailableStock(book.getAvailableStock() - 1);
        bookRepository.save(book);

        // kiralama kaydı oluştur
        Rental rental = new Rental();
        rental.setUser(user);
        rental.setBook(book);
        rental.setRentDate(LocalDate.now());
        rental.setDueDate(LocalDate.now().plusDays(RENTAL_PERIOD_DAYS));
        rental.setStatus(RentalStatus.APPROVED);

        Rental savedRental = rentalRepository.save(rental);
        return mapToResponse(savedRental);
    }

    @Transactional
    // --- 2. iade işlemi (kütüphaneci/admin yapar) ---
    public RentalResponse returnBook(Long rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Rental record not found."));

        // zaten iade edilmiş mi kontrolü
        if (rental.getStatus() == RentalStatus.RETURNED) {
            throw new RuntimeException("Book is already returned.");
        }

        // gecikme cezası hesaplama
        LocalDate today = LocalDate.now();
        BigDecimal penalty = BigDecimal.ZERO;

        if (today.isAfter(rental.getDueDate())) {
            long daysLate = ChronoUnit.DAYS.between(rental.getDueDate(), today);
            if (daysLate > 0) {
                penalty = DAILY_PENALTY_RATE.multiply(BigDecimal.valueOf(daysLate));

                // cezayı cüzdandan tahsil et
                Wallet wallet = walletRepository.findByUser(rental.getUser())
                        .orElseThrow(() -> new RuntimeException("User wallet not found."));

                wallet.setBalance(wallet.getBalance().subtract(penalty));
                walletRepository.save(wallet);

                // işlem logu oluştur
                walletService.saveTransaction(wallet, TransactionType.PENALTY_PAYMENT, penalty, rental.getBook().getId());
            }
        }

        // kiralama kaydını güncelle
        rental.setReturnDate(today);
        rental.setStatus(RentalStatus.RETURNED);
        rental.setPenaltyFee(penalty);

        // stok artırma
        Book book = rental.getBook();
        book.setAvailableStock(book.getAvailableStock() + 1);
        bookRepository.save(book);

        // gamification entegrasyonu (ileride eklenecek)

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
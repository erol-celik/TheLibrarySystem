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

        // kural: stok kontrolü (Talep için kontrol)
        if (book.getAvailableStock() <= 0) {
            // Not: Stok sıfır olsa bile REQUESTED yapılabilir, kütüphaneci karar verir.
            // Ancak mevcut kuralı koruyalım, talep bile olsa stok olmalı.
            throw new RuntimeException("Book is out of stock.");
        }

        // kural: tek kitap limiti (sadece APPROVED veya REQUESTED kayıtları kontrol
        // edilmeli)
        // Kullanıcının elinde onaylı (APPROVED) veya bekleyen (REQUESTED) kitap var mı?
        // NOT: RentalRepository'de sadece APPROVED kontrolü var. REQUESTED'ı da eklemek
        // gerekir.
        // Şimdilik sadece APPROVED üzerinden devam edelim.
        boolean hasActiveRental = rentalRepository.existsByUserIdAndStatus(user.getId(), RentalStatus.APPROVED);

        if (hasActiveRental) {
            throw new RuntimeException("You can only rent 1 book at a time. Please return your current book first.");
        }

        // **!!! STOK İŞLEMLERİ BURADAN SİLİNDİ !!!** (Onaylama metoduna taşındı)

        // kiralama kaydı oluştur
        Rental rental = new Rental();
        rental.setUser(user);
        rental.setBook(book);

        // Durumu REQUESTED olarak ayarla
        rental.setStatus(RentalStatus.REQUESTED);

        // Not: RentDate ve DueDate, REQUESTED anında da ayarlanabilir.
        // Ancak bu, kütüphaneci onayladığında daha anlamlı olur.
        // Fakat entity'de nullable=false olduğu için burada ayarlayalım:
        rental.setRentDate(LocalDate.now());
        // DueDate, RentDate'e göre ayarlanır (Bu tarih kütüphanecinin onayladığı tarih
        // değil, requestin başladığı tarihtir).
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
    // --- 4. Kiralama Talebini Onaylama (Librarian/Admin yapar) ---
    public RentalResponse approveRentalRequest(Long rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Rental request not found."));

        // Sadece REQUESTED durumundaki talepler onaylanabilir
        if (rental.getStatus() != RentalStatus.REQUESTED) {
            throw new RuntimeException("Only REQUESTED rentals can be approved. Current status: " + rental.getStatus());
        }

        // 1. Stok kontrolü (Olası stok tükenmesi kontrolü)
        Book book = rental.getBook();
        if (book.getAvailableStock() <= 0) {
            // Onaylama aşamasında stok bitti, talebi reddetme mekanizması devreye
            // girebilir.
            throw new RuntimeException("Book is out of stock. Cannot approve rental.");
        }

        // 2. Stok düşürme
        book.setAvailableStock(book.getAvailableStock() - 1);
        bookRepository.save(book);

        // 3. Kiralama kaydını güncelleme
        rental.setStatus(RentalStatus.APPROVED);

        // Not: Eğer kiralama süresi onay tarihinden itibaren başlamalıysa
        // buradaki rentDate ve DueDate değerleri güncellenmelidir.
        // Mevcut yapıda request anından itibaren saydığımızı varsayıyoruz.
        String message = String.format("Kiralamanız onaylandı! Kitap: %s. Son iade tarihi: %s",
                rental.getBook().getTitle(),
                rental.getDueDate());

        notificationService.sendSystemNotification(rental.getUser(), message);

        Rental savedRental = rentalRepository.save(rental);
        return mapToResponse(savedRental);
    }

    @Transactional
    // --- 5. Kiralama Talebini Reddetme (Librarian/Admin yapar) ---
    public RentalResponse rejectRentalRequest(Long rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Rental request not found."));

        if (rental.getStatus() != RentalStatus.REQUESTED) {
            throw new RuntimeException("Only REQUESTED rentals can be rejected. Current status: " + rental.getStatus());
        }

        rental.setStatus(RentalStatus.REJECTED);

        String message = String.format("Maalesef kiralama talebiniz reddedildi. Kitap: %s.",
                rental.getBook().getTitle());

        notificationService.sendSystemNotification(rental.getUser(), message);

        Rental savedRental = rentalRepository.save(rental);
        return mapToResponse(savedRental);
    }

    public List<RentalResponse> getRentalHistoryByUserEmail(String userEmail) {
        // 1. Kullanıcıyı e-posta ile bul
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found."));

        // 2. Kullanıcının tüm kiralama kayıtlarını çek
        List<Rental> rentals = rentalRepository.findByUserId(user.getId()); // Repository'de bu metot zaten tanımlı

        // 3. Listeyi RentalResponse DTO'suna map'le ve geri dön
        return rentals.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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
                walletService.saveTransaction(wallet, TransactionType.PENALTY_PAYMENT, penalty,
                        rental.getBook().getId());
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

    @Transactional
    public RentalResponse userReturnBook(String userEmail, Long rentalId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found."));

        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Rental record not found."));

        // Sahiplik kontrolü
        if (!rental.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to return this book.");
        }

        // İade işlemini gerçekleştir
        RentalResponse response = returnBook(rentalId);

        // Kütüphanecileri bilgilendir
        String message = String.format("A book has been returned by %s. Title: %s", user.getName(),
                rental.getBook().getTitle());

        notificationService.sendNotificationToRole(com.library.backend.entity.enums.RoleType.LIBRARIAN, message);

        return response;
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
package com.library.backend.service;

import com.library.backend.entity.*;
import com.library.backend.entity.enums.BookSaleType;
import com.library.backend.entity.enums.BookType;
import com.library.backend.entity.enums.TransactionType;
import com.library.backend.repository.BookRepository;
import com.library.backend.repository.BookSaleRepository;
import com.library.backend.repository.UserRepository;
import com.library.backend.repository.WalletRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class BookSaleService {

    private final BookSaleRepository bookSaleRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final WalletService walletService;
    private final NotificationService notificationService;

    @Transactional
    public void purchaseBook(String email, Long bookId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (book.getBookType() == BookType.PHYSICAL) {
            throw new RuntimeException("Physical books cannot be purchased digitally.");
        }

        if (bookSaleRepository.existsByUserIdAndBookId(user.getId(), book.getId())) {
            throw new RuntimeException("You have already purchased this book.");
        }

        BigDecimal price = book.getPrice();
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Invalid book price.");
        }

        // 1. Process Wallet Transaction
        walletService.withdrawFunds(user, price);

        // Manual transaction log since withdrawFunds doesn't log it
        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
        walletService.saveTransaction(wallet, TransactionType.PURCHASE, price, book.getId());

        // 2. Record the Sale
        BookSale sale = new BookSale();
        sale.setUser(user);
        sale.setBook(book);
        sale.setSoldPrice(price);
        sale.setBookSaleType(
                book.getBookType() == BookType.DIGITAL ? BookSaleType.DIGITAL_COPY : BookSaleType.DIGITAL_COPY); // As
                                                                                                                 // per
                                                                                                                 // requirement,
                                                                                                                 // HYBRID
                                                                                                                 // purchase
                                                                                                                 // implies
                                                                                                                 // digital
                                                                                                                 // copy
        bookSaleRepository.save(sale);

        // 3. Notify User
        String downloadLink = book.getEbookFilePath();
        String message = String.format("Purchase successful! You can now access '%s' here: %s",
                book.getTitle(), (downloadLink != null ? downloadLink : "Link will be available in your library."));
        notificationService.sendSystemNotification(user, message);
    }
}

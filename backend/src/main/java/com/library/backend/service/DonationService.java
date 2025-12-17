package com.library.backend.service;

import com.library.backend.dto.contribution.DonationRequest;
import com.library.backend.entity.*;
import com.library.backend.entity.enums.DonationStatus;
import com.library.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DonationService {

    private final DonationRepository donationRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final NotificationService notificationService;

    @Transactional
    // 1. Bağış Talebi Oluştur (USER)
    public void createDonation(String userEmail, DonationRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found."));

        Donation donation = new Donation();
        donation.setUser(user);
        donation.setBookTitle(request.getBookTitle());
        donation.setBookAuthor(request.getBookAuthor());
        donation.setStatus(DonationStatus.PENDING);
        // description alanı entity'de yoksa ekleyebilirsin veya şimdilik pas geçebilirsin.
        // donation.setDescription(request.getDescription());

        donationRepository.save(donation);
    }

    // 2. Bekleyen Bağışları Getir (LIBRARIAN)
    public List<Donation> getPendingDonations() {
        return donationRepository.findByStatus(DonationStatus.PENDING);
    }

    @Transactional
    // 3. Bağışı İşle (LIBRARIAN)
    public void processDonation(Long librarianId, Long donationId, boolean isApproved, String rejectionReason) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new RuntimeException("Donation not found."));

        if (donation.getStatus() != DonationStatus.PENDING) {
            throw new RuntimeException("This donation has already been processed.");
        }

        if (isApproved) {
            donation.setStatus(DonationStatus.APPROVED);

            // A. KİTAP STOĞUNU GÜNCELLE
            // Kitap sistemde var mı? (İsme ve yazara göre basit kontrol)
            // Daha hassas kontrol için ISBN gerekirdi ama bağışta ISBN olmayabilir.
            Optional<Book> existingBook = bookRepository.findByTitleContainingIgnoreCase(donation.getBookTitle())
                    .stream()
                    .filter(b -> b.getAuthor().equalsIgnoreCase(donation.getBookAuthor()))
                    .findFirst();

            if (existingBook.isPresent()) {
                Book book = existingBook.get();
                book.setAvailableStock(book.getAvailableStock() + 1);
                book.setTotalStock(book.getTotalStock() + 1);
                bookRepository.save(book);
            } else {
                // Kitap yoksa kütüphaneciye "Manuel Ekle" uyarısı dönülebilir
                // veya burada otomatik eklenebilir.
                // Biz şimdilik not düşelim: "Kitap otomatik eklenmedi, librarian manuel eklemeli."
            }



            // C. BİLDİRİM GÖNDER
            String message = "Your donation for '" + donation.getBookTitle() + "' has been accepted. Thank you for your support!";
            notificationService.sendNotificationById(librarianId, donation.getUser().getId(), message);

        } else {
            donation.setStatus(DonationStatus.REJECTED);

            // RED BİLDİRİMİ
            String message = "Your donation for '" + donation.getBookTitle() + "' was not accepted. Reason: " + rejectionReason;
            notificationService.sendNotificationById(librarianId, donation.getUser().getId(), message);
        }

        donationRepository.save(donation);
    }

    // 4. Bağış Geçmişim (USER)
    public List<Donation> getMyDonations(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        return donationRepository.findByUserId(user.getId());
    }
}
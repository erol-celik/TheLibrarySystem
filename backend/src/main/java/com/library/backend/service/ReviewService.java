package com.library.backend.service;

import com.library.backend.dto.social.ReviewRequest;
import com.library.backend.entity.*;
import com.library.backend.repository.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewLikeRepository reviewLikeRepository;
    private final RentalRepository rentalRepository;
    private final BookSaleRepository bookSaleRepository;
    private final DonationRepository donationRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    // küfür listesini burada tutacağız
    private List<String> badWords = new ArrayList<>();

    // uygulama ayağa kalkarken bu metod bir kez çalışır ve dosyayı okur
    @PostConstruct
    public void loadBadWords() {
        try {
            ClassPathResource resource = new ClassPathResource("bad-words.txt");
            BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                badWords.add(line.trim().toLowerCase());
            }
            reader.close();
            // log atılabilir: küfür listesi yüklendi
        } catch (IOException e) {
            // dosya yoksa veya okunamadıysa uygulama çökmesin, boş listeyle devam etsin
            System.err.println("Warning: bad-words.txt not found.");
        }
    }

    @Transactional
    // --- 16. yorum yapma servisi ---
    public void addReview(String userEmail, ReviewRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found."));

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found."));

        // yetki kontrolü: kullanıcı bu kitapla etkileşime girdi mi?
        boolean hasRented = rentalRepository.existsByUserIdAndBookId(user.getId(), book.getId());
        boolean hasBought = bookSaleRepository.existsByUserIdAndBookId(user.getId(), book.getId());
        boolean hasDonated = donationRepository.existsByUserIdAndBookTitleIgnoreCase(user.getId(), book.getTitle());

        if (!hasRented && !hasBought && !hasDonated) {
            throw new RuntimeException("You must rent, buy, or donate this book before reviewing it.");
        }

        if (reviewRepository.existsByUserIdAndBookId(user.getId(), book.getId())) {
            throw new RuntimeException("You have already reviewed this book.");
        }

        String cleanComment = filterProfanity(request.getComment());

        Review review = new Review();
        review.setUser(user);
        review.setBook(book);
        review.setStars(request.getStars());
        review.setComment(cleanComment);
        review.setSpoiler(request.isSpoiler());
        review.setHelpfulCount(0);
        updateBookRating(book);
        reviewRepository.save(review);
    }

    private void updateBookRating(Book book) {
        // O kitaba ait tüm yorumları çek
        List<Review> reviews = reviewRepository.findAllByBookId(book.getId());

        if (reviews.isEmpty()) {
            book.setRating(0.0);
            book.setReviewCount(0);
        } else {
            double average = reviews.stream()
                    .mapToInt(Review::getStars)
                    .average()
                    .orElse(0.0);

            // Virgülden sonra tek hane kalsın (örn: 4.5)
            double roundedAverage = Math.round(average * 10.0) / 10.0;

            book.setRating(roundedAverage);
            book.setReviewCount(reviews.size());
        }

        bookRepository.save(book);
    }

    @Transactional
    // --- YENİ: yorum güncelleme servisi ---
    public void updateReview(String userEmail, Long reviewId, ReviewRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found."));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found."));

        // sadece yorumun sahibi güncelleyebilir
        if (!review.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only edit your own reviews.");
        }

        // yeni içeriği tekrar filtreden geçir
        String cleanComment = filterProfanity(request.getComment());

        review.setStars(request.getStars());
        review.setComment(cleanComment);
        review.setSpoiler(request.isSpoiler());
        // helpfulCount sıfırlanmaz, olduğu gibi kalır

        reviewRepository.save(review);
    }

    @Transactional
    // --- 17. yorum beğenme (toggle) servisi ---
    public void toggleLike(String userEmail, Long reviewId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found."));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found."));

        if (review.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You cannot like your own review.");
        }

        boolean alreadyLiked = reviewLikeRepository.existsByUserIdAndReviewId(user.getId(), reviewId);

        if (alreadyLiked) {
            ReviewLike like = reviewLikeRepository.findByUserIdAndReviewId(user.getId(), reviewId).orElseThrow();
            reviewLikeRepository.delete(like);
            review.setHelpfulCount(review.getHelpfulCount() - 1);
        } else {
            ReviewLike newLike = new ReviewLike();
            newLike.setUser(user);
            newLike.setReview(review);
            reviewLikeRepository.save(newLike);
            review.setHelpfulCount(review.getHelpfulCount() + 1);
        }

        reviewRepository.save(review);
    }

    // güncellenmiş filtre metodu
    private String filterProfanity(String text) {
        if (text == null)
            return "";
        String filtered = text;
        // dosyadan okunan listeyi kullan
        for (String word : badWords) {
            filtered = filtered.replaceAll("(?i)" + word, "***");
        }
        return filtered;
    }

    public List<Review> getReviewsByBookId(Long bookId) {
        return reviewRepository.findReviewsByBookId(bookId);
    }
}
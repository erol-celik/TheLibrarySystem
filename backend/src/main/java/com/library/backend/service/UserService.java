package com.library.backend.service;

import com.library.backend.dto.book.BookResponse;
import com.library.backend.dto.user.AdminUserResponse;
import com.library.backend.dto.user.UserProfileResponse;
import com.library.backend.dto.user.UserProfileUpdateRequest;
import com.library.backend.entity.Book;
import com.library.backend.entity.User;
import com.library.backend.entity.Wallet;
import com.library.backend.repository.UserRepository;
import com.library.backend.repository.*;
import com.library.backend.repository.UserRepository;
import com.library.backend.repository.WalletRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final DonationRepository donationRepository;
    private final FeedbackRepository feedbackRepository;
    private final BookSuggestionRepository bookSuggestionRepository;
    private final ReviewRepository reviewRepository;
    private final RentalRepository rentalRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    public UserService(UserRepository userRepository,
            WalletRepository walletRepository,
            DonationRepository donationRepository,
            FeedbackRepository feedbackRepository,
            BookSuggestionRepository bookSuggestionRepository,
            ReviewRepository reviewRepository,
            RentalRepository rentalRepository,
            NotificationRepository notificationRepository,
            NotificationService notificationService) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.donationRepository = donationRepository;
        this.feedbackRepository = feedbackRepository;
        this.bookSuggestionRepository = bookSuggestionRepository;
        this.reviewRepository = reviewRepository;
        this.rentalRepository = rentalRepository;
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile(String authenticatedUserEmail) {

        User user = userRepository.findByEmail(authenticatedUserEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Active user not found."));

        if (user.isBanned()) {
            System.out.println("Your account has been suspended by an administrator.");
            throw new BadCredentialsException("Your account has been suspended by an administrator.");
        }
        // Get wallet information
        BigDecimal balance = walletRepository.findByUser(user)
                .map(Wallet::getBalance)
                .orElse(BigDecimal.ZERO);

        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setBanned(user.isBanned());
        response.setEmail(user.getEmail());
        response.setRoles(user.getRoles());
        response.setWalletBalance(balance);
        response.setAvatarUrl(user.getAvatarUrl());
        response.setBio(user.getBio());
        response.setPhone(user.getPhoneNumber());
        response.setAddress(user.getAddress());
        if (!user.getRoles().isEmpty()) {
            // Set role with ROLE_ prefix
            response.setRole("ROLE_" + user.getRoles().iterator().next().name().toUpperCase());
        }
        response.setCreatedDate(user.getCreatedDate());

        // Calculate rental statistics
        long totalBorrowed = rentalRepository.countByUserId(user.getId());
        long activeLoans = rentalRepository.countByUserIdAndStatus(user.getId(),
                com.library.backend.entity.enums.RentalStatus.APPROVED);
        response.setTotalBorrowedCount(totalBorrowed);
        response.setActiveLoanCount(activeLoans);

        return response;
    }

    @Transactional
    public UserProfileResponse updateMyProfile(String authenticatedUserEmail, UserProfileUpdateRequest request) {

        User user = userRepository.findByEmail(authenticatedUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.isBanned()) {
            System.out.println("Your account has been suspended by an administrator.");
            throw new BadCredentialsException("Your account has been suspended by an administrator.");
        }
        // Update username (if not empty or null)
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        // Update avatar and bio fields (null means clear the field)
        user.setAvatarUrl(request.getProfilePictureUrl());
        user.setBio(request.getBio());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());

        userRepository.save(user);

        // Return updated profile with Wallet and Badge info
        return getMyProfile(user.getEmail());
    }

    @Transactional
    public void banUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User to be banned not found."));

        user.setBanned(!user.isBanned());
        userRepository.save(user);

        // Notify User
        String status = user.isBanned() ? "suspended" : "reactivated";
        String message = String.format("Admin Alert: Your account has been %s.", status);
        notificationService.sendSystemNotification(user, message);

    }

    public List<AdminUserResponse> listUsers(Optional<Boolean> isBanned) {
        if (isBanned.isPresent()) {
            List<User> selectedUsers = userRepository.findAllByIsBanned(isBanned.get());

            return convertToDtoList(selectedUsers);
        }

        List<User> allUsers = userRepository.findAll();
        return convertToDtoList(allUsers);
    }

    private List<AdminUserResponse> convertToDtoList(List<User> users) {
        return users.stream()
                .map(this::mapToAdminUserResponse)
                .collect(Collectors.toList());
    }

    private AdminUserResponse mapToAdminUserResponse(User user) {
        AdminUserResponse response = new AdminUserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setJoinDate(user.getCreatedDate());
        response.setRole(user.getRoles());
        response.setBanned(user.isBanned());
        response.setPenaltyCount(user.getPenaltyCount());

        return response;
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Delete Notifications (sent or received)
        List<com.library.backend.entity.Notification> notifications = notificationRepository.findAll().stream()
                .filter(n -> (n.getRecipientUser() != null && n.getRecipientUser().getId().equals(userId)) ||
                        (n.getSenderUser() != null && n.getSenderUser().getId().equals(userId)))
                .collect(Collectors.toList());
        notificationRepository.deleteAll(notifications);

        // 2. Delete Donations
        List<com.library.backend.entity.Donation> donations = donationRepository.findAll().stream()
                .filter(d -> d.getUser() != null && d.getUser().getId().equals(userId))
                .collect(Collectors.toList());
        donationRepository.deleteAll(donations);

        // 3. Suggestions
        List<com.library.backend.entity.BookSuggestion> suggestions = bookSuggestionRepository.findAll().stream()
                .filter(s -> s.getSuggesterUser() != null && s.getSuggesterUser().getId().equals(userId))
                .collect(Collectors.toList());
        bookSuggestionRepository.deleteAll(suggestions);

        // 4. Feedbacks
        List<com.library.backend.entity.Feedback> feedbacks = feedbackRepository.findAll().stream()
                .filter(f -> f.getUser() != null && f.getUser().getId().equals(userId))
                .collect(Collectors.toList());
        feedbackRepository.deleteAll(feedbacks);

        // 5. Reviews
        List<com.library.backend.entity.Review> reviews = reviewRepository.findAll().stream()
                .filter(r -> r.getUser() != null && r.getUser().getId().equals(userId))
                .collect(Collectors.toList());
        reviewRepository.deleteAll(reviews);

        // 6. Rentals / Loans
        List<com.library.backend.entity.Rental> rentals = rentalRepository.findAll().stream()
                .filter(r -> r.getUser() != null && r.getUser().getId().equals(userId))
                .collect(Collectors.toList());
        rentalRepository.deleteAll(rentals);

        // 7. Wallet
        walletRepository.findByUser(user).ifPresent(walletRepository::delete);

        // Finally delete user
        userRepository.delete(user);
    }

    @Transactional
    public void updatePenalty(Long userId, int penaltyCount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPenaltyCount(penaltyCount);
        userRepository.save(user);

        // Notify User
        String message = String.format("Admin Alert: Your penalty count has been updated to %d.", penaltyCount);
        notificationService.sendSystemNotification(user, message);
    }

    @Transactional
    public void updateUserStatus(Long userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("BLOCKED".equalsIgnoreCase(status)) {
            user.setBanned(true);
        } else if ("ACTIVE".equalsIgnoreCase(status)) {
            user.setBanned(false);
        }
        userRepository.save(user);
    }
}

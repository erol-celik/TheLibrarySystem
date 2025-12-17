package com.library.backend.service;

import com.library.backend.dto.book.BookResponse;
import com.library.backend.dto.user.AdminUserResponse;
import com.library.backend.dto.user.UserProfileResponse;
import com.library.backend.dto.user.UserProfileUpdateRequest;
import com.library.backend.entity.Book;
import com.library.backend.entity.User;
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
    public UserService(UserRepository userRepository, WalletRepository walletRepository) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile(String authenticatedUserEmail) {

        User user = userRepository.findByEmail(authenticatedUserEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Aktif kullanıcı bulunamadı."));

        if(user.isBanned()){
            System.out.println("Hesabınız yönetici tarafından askıya alınmıştır.");
            throw new BadCredentialsException("Hesabınız yönetici tarafından askıya alınmıştır.");
        }
        // Cüzdan bilgisini çekme
        BigDecimal balance = walletRepository.findByUser(user)
                .map(wallet -> wallet.getBalance())
                .orElse(BigDecimal.ZERO); // Cüzdan yoksa 0 dön

        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setBanned(user.isBanned());
        response.setEmail(user.getEmail());
        response.setRoles(user.getRoles());
        response.setWalletBalance(balance);
        response.setAvatarUrl(user.getAvatarUrl());
        response.setBio(user.getBio());
        return response;
    }

    @Transactional
    public UserProfileResponse updateMyProfile(String authenticatedUserEmail, UserProfileUpdateRequest request) {

        User user = userRepository.findByEmail(authenticatedUserEmail)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));


        if(user.isBanned()){
            System.out.println("Hesabınız yönetici tarafından askıya alınmıştır.");
            throw new BadCredentialsException("Hesabınız yönetici tarafından askıya alınmıştır.");
        }
        // Kullanıcı adı güncelleme (boş veya null değilse)
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        // Avatar ve Bio alanlarını güncelleme (null ile göndermek temizlemek anlamına gelir)
        user.setAvatarUrl(request.getProfilePictureUrl());
        user.setBio(request.getBio());

        userRepository.save(user);

        // Güncel profili döndürürken Wallet ve Badge bilgileri de çekilir
        return getMyProfile(user.getEmail());
    }


    @Transactional
    public void banUser(Long userId){
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new RuntimeException("Yasaklanacak kullanıcı bulunamadı."));

        user.setBanned(!user.isBanned());


        userRepository.save(user);

    }

    public List<AdminUserResponse> listUsers(Optional<Boolean> isBanned){
        if(isBanned.isPresent()){
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


    private AdminUserResponse mapToAdminUserResponse(User user){
        AdminUserResponse response = new AdminUserResponse();
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setJoinDate(user.getCreatedDate());
        response.setRole(user.getRoles());

        return response;
    }
}

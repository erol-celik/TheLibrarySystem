package com.library.backend.service;

import com.library.backend.dto.auth.AuthResponse;
import com.library.backend.dto.auth.LoginRequest;
import com.library.backend.dto.auth.RegisterRequest;
import com.library.backend.dto.user.UserDTO;
import com.library.backend.entity.User;
import com.library.backend.entity.enums.RoleType;
import com.library.backend.repository.UserRepository;
import com.library.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager; // Spring Security'nin Polisi

    public AuthResponse register(RegisterRequest request) {
        // 1. Email Kontrolü
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Bu e-posta adresi zaten kullanılıyor.");
        }

        // 2. Kullanıcıyı Oluştur
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // Şifreyi Hashle

        // Varsayılan rol USER
        user.getRoles().add(RoleType.USER);

        // 3. Kaydet
        User savedUser = userRepository.save(user);

        // 4. Token Üret (Kayıt olunca otomatik giriş yapmış sayılsın)
        // UserDetailService entegrasyonu sayesinde User sınıfı UserDetails'i implemente etmeli
        // VEYA burada UserDetailsServiceImpl'deki mantığı kullanmalıyız.
        // Hızlı çözüm için UserDetailsServiceImpl'i çağırabiliriz ama
        // User sınıfımız UserDetails implemente ederse daha temiz olur.
        // Şimdilik token üretimi için customUserDetails oluşturalım:
        var userDetails = new org.springframework.security.core.userdetails.User(
                savedUser.getEmail(),
                savedUser.getPassword(),
                savedUser.getAuthorities() // User entity içindeki getAuthorities metodu önemli
        );

        String jwtToken = jwtService.generateToken(userDetails);

        // 5. Cevabı Dön
        return AuthResponse.builder()
                .token(jwtToken)
                .user(mapToDTO(savedUser))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        // 1. KİMLİK DOĞRULAMA (AuthenticationManager devreye girer)
        // Bu metod gidip UserDetailsService'i çalıştırır, şifreleri (hash) kıyaslar.
        // Hata varsa "BadCredentialsException" fırlatır, biz uğraşmayız.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // 2. Kullanıcıyı Bul (Zaten doğrulandı, veritabanından çekelim)
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));

        // 3. UserDetails objesi oluştur (Token için lazım)
        var userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.getAuthorities()
        );

        // 4. Token Üret
        String jwtToken = jwtService.generateToken(userDetails);

        // 5. Cevabı Dön
        return AuthResponse.builder()
                .token(jwtToken)
                .user(mapToDTO(user))
                .build();
    }

    private UserDTO mapToDTO(User entity) {
        UserDTO dto = new UserDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setEmail(entity.getEmail());
        return dto;
    }
}
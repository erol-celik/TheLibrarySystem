package com.library.backend.security;

import org.springframework.security.core.userdetails.UserDetailsService;
import com.library.backend.entity.User;
import com.library.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // 1. Veritabanından kullanıcıyı E-Mail ile bul
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Kullanıcı bulunamadı: " + email));

        // 2. Kullanıcının rollerini (USER, ADMIN) Spring Security formatına çevir
        // Spring Security rollerin başında "ROLE_" bekler (Örn: ROLE_ADMIN)
        Collection<? extends GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toList());

        // 3. Kullanıcı bilgilerini Spring Security'nin anladığı User objesi olarak döndür
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),      // Kullanıcı adı niyetine email
                user.getPassword(),   // Şifre (Hashli)
                authorities           // Yetkiler
        );
    }
}
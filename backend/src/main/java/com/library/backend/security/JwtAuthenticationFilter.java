package com.library.backend.security; // Senin yeni paketin

import com.library.backend.security.JwtService;
import com.library.backend.security.UserDetailsServiceImpl; // Service paketinde bırakmıştık
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. İsteğin Başlığından (Header) Token'ı Al
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // 2. Kontrol: Header boş mu veya "Bearer " ile başlamıyor mu?
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // Token yoksa polisi çağırma, belki adam halka açık sayfaya (Login/Register) gidiyordur.
            // Kararı bir sonraki güvenlik duvarına bırak ve zinciri devam ettir.
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Token'ı Ayıkla ("Bearer " kısmını at, gerisini al)
        jwt = authHeader.substring(7);

        // 4. Token'ın içinden E-Postayı (Kullanıcı Adını) çıkar
        userEmail = jwtService.extractUsername(jwt);

        // 5. E-posta var mı ve kullanıcı henüz sisteme giriş yapmış görünmüyor mu?
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Veritabanından bu kullanıcıyı bul
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // 6. Token geçerli mi? (İmzası doğru mu, süresi dolmuş mu?)
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // 7. GEÇERLİ! O zaman sisteme "Bu adam Ali'dir, yetkileri de şunlardır" diye kaydet.
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // Güvenlik Context'ine kimliği koyuyoruz. Artık Spring Security Ali'yi tanıyor.
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 8. İsteği devam ettir (Controller'a gitmesine izin ver)
        filterChain.doFilter(request, response);
    }
}
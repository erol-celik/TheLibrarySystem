package com.library.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class JwtService {

    // BU ÇOK GİZLİ BİR ANAHTARDIR. Normalde .env dosyasında saklanır.
    // Şimdilik buraya uzun ve karmaşık bir metin yazıyoruz (Hex formatında 256-bit key önerilir)
    // Örnek olarak rastgele üretilmiş güvenli bir key:
    private static final String SECRET_KEY = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    // 1. Token'dan Kullanıcı Adını (Email) Çıkarma
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 2. Token'dan Herhangi Bir Veriyi Çıkarma (Helper)
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // 3. Yeni Token Üretme (Sadece UserDetails ile)
   /* public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }*/
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();

        // KRİTİK: Yetkileri String listesi olarak claims'e ekle
        claims.put("roles", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));

        return generateToken(claims, userDetails); // claims map'ini gönderiyoruz
    }
    // 4. Yeni Token Üretme (Ekstra Verilerle - Örn: Roller)
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername()) // Email'i subject yapıyoruz
                .setIssuedAt(new Date(System.currentTimeMillis())) // Oluşturulma tarihi
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 Saat Geçerli
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) // İmzala
                .compact();
    }


    // 5. Token Geçerli mi? (Süresi dolmuş mu, kullanıcı adı tutuyor mu?)
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
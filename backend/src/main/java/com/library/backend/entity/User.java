package com.library.backend.entity;

import com.library.backend.entity.enums.RoleType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "users")
@Data
@EqualsAndHashCode(callSuper = true)
public class User extends BaseEntity implements UserDetails {

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Column(name = "is_banned", nullable = false)
    private boolean isBanned = false;

    @Column(name="avatar_url")
    private String avatarUrl;

    @Column(name="bio", columnDefinition = "TEXT")
    private String bio;

    // --- SCORE ALANI BURADAN SİLİNDİ ---

    @ElementCollection(targetClass = RoleType.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Set<RoleType> roles = new HashSet<>();

    // --- SECURITY METODLARI ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toList());
    }

    @ManyToMany(fetch = FetchType.EAGER) // Genellikle rozetler profille birlikte yüklensin istenir (EAGER)
    @JoinTable(
            name = "user_badges", // Veritabanındaki ara tablo adı
            joinColumns = @JoinColumn(name = "user_id"), // User tablosundan buraya gelen kolon
            inverseJoinColumns = @JoinColumn(name = "badge_id") // Badge tablosundan gelen kolon
    )
    private Set<Badge> badges = new HashSet<>();

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return !isBanned; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
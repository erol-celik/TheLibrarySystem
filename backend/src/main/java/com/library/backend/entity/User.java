package com.library.backend.entity;

import com.library.backend.entity.enums.RoleType;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@EqualsAndHashCode(callSuper = true)
public class User extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Column
    private String bio;

    @Column
    private String profilePicUrl;

    @Column(name = "is_banned", nullable = false)
    private boolean isBanned = false;

    // User.java Entity'nizde Wallet ilişkisi (Wallet'ı da kaydetmek için)
   /* @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Wallet wallet;*/

    @ManyToMany(fetch = FetchType.EAGER) // Genellikle rozetler profille birlikte yüklensin istenir (EAGER)
    @JoinTable(
            name = "user_badges", // Veritabanındaki ara tablo adı
            joinColumns = @JoinColumn(name = "user_id"), // User tablosundan buraya gelen kolon
            inverseJoinColumns = @JoinColumn(name = "badge_id") // Badge tablosundan gelen kolon
    )
    private Set<Badge> badges = new HashSet<>();

    // 5. ROLLER (RBAC Kilit Noktası)
    // Ayrı bir 'Role' tablosu yerine, User'a bağlı 'user_roles' adında
    // basit bir yan tablo oluşturur. En temiz yöntem budur.
    @ElementCollection(targetClass = RoleType.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Set<RoleType> roles = new HashSet<>();

    // Spring Security için yetkileri döndüren yardımcı metod
    public java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> getAuthorities() {
        return this.roles.stream()
                .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(java.util.stream.Collectors.toList());
    }



}
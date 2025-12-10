package com.library.backend.entity;

import com.library.backend.entity.enums.RoleType;
import jakarta.persistence.*;
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

    @Column(name = "is_banned", nullable = false)
    private boolean isBanned = false;

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
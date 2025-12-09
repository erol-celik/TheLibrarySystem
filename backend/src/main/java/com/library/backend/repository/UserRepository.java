package com.library.backend.repository;

import com.library.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// Bu interface sayesinde SQL yazmadan "save", "findById", "findAll" gibi metodlara sahip olacağız.
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Özel sorgular buraya eklenecek (Örn: email ile bul)

    Optional<User> findByEmail(String email);
}
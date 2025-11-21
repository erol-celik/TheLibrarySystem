package com.library.backend.repository;

import com.library.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

// Bu interface sayesinde SQL yazmadan "save", "findById", "findAll" gibi metodlara sahip olacağız.
public interface UserRepository extends JpaRepository<User, Long> {
    // Özel sorgular buraya eklenecek (Örn: email ile bul)
}
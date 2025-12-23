package com.library.backend.repository;

import com.library.backend.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    // Tag'i ismine göre (Örn: 'Hüzünlü') bulmak için
    Optional<Tag> findByName(String name);

    // Book entity'sinde Tag'lerin kontrolünü basitleştirmek için var mı yok mu
    // kontrolü
    boolean existsByName(String name);

    Optional<Tag> findByNameIgnoreCase(String name);

    // Sadece aktif kitaplarda geçen tagleri getir

    List<Tag> findAll();
}
package com.library.backend.repository;

import com.library.backend.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {

    // Tag'i ismine göre (Örn: 'Hüzünlü') bulmak için
    Optional<Tag> findByName(String name);

    // Book entity'sinde Tag'lerin kontrolünü basitleştirmek için var mı yok mu kontrolü
    boolean existsByName(String name);
}
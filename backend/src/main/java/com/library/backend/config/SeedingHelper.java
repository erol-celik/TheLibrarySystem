package com.library.backend.config; // Veya ilgili config/util paketiniz

import com.library.backend.entity.Category;
import com.library.backend.entity.Tag;
import com.library.backend.repository.CategoryRepository;
import com.library.backend.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class SeedingHelper {

    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;

    // --- KATEGORİLERİ KAYDETME (AYRI TRANSACTION) ---
    @Transactional
    public void seedCategoriesIfEmpty() {
        if (categoryRepository.count() == 0) {

            // 1. Kategoriler oluşturulup kaydediliyor
            categoryRepository.save(createCategory("Bilim Kurgu"));
            categoryRepository.save(createCategory("Dram"));
            categoryRepository.save(createCategory("Felsefe"));

            System.out.println("-> Kategoriler başarıyla eklendi.");
        }
    }

    // --- TAG'LERİ KAYDETME (AYRI TRANSACTION) ---
    @Transactional
    public void seedTagsIfEmpty() {
        if (tagRepository.count() == 0) {
            // 2. Tag'ler oluşturulup kaydediliyor
            tagRepository.save(createTag("Uzay"));
            tagRepository.save(createTag("Epik"));
            tagRepository.save(createTag("Politik"));
            tagRepository.save(createTag("Varoluşçu"));

            System.out.println("-> Tagler başarıyla eklendi.");
        }
    }

    // Yardımcı metotlar
    private Category createCategory(String name) {
        Category category = new Category();
        category.setName(name);
        category.setCreatedDate(LocalDateTime.now());
        return category;
    }

    private Tag createTag(String name) {
        Tag tag = new Tag();
        tag.setName(name);
        return tag;
    }
}

package com.library.backend.config;

import com.library.backend.entity.Book;
import com.library.backend.entity.Category;
import com.library.backend.entity.enums.BookType;
import com.library.backend.repository.BookRepository;
import com.library.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {

        // Eğer veritabanı boşsa çalış
        if (bookRepository.count() == 0) {

            // 1. KATEGORİLER
            Category bilimKurgu = new Category();
            bilimKurgu.setName("Bilim Kurgu");
            bilimKurgu.setCreatedDate(LocalDateTime.now());
            categoryRepository.save(bilimKurgu);

            Category dram = new Category();
            dram.setName("Dram");
            dram.setCreatedDate(LocalDateTime.now());
            categoryRepository.save(dram);

            // 2. KİTAP 1: DUNE
            Book dune = new Book();
            dune.setTitle("Dune");
            dune.setAuthor("Frank Herbert");
            dune.setIsbn("1234567890");
            dune.setImageUrl("https://images.penguinrandomhouse.com/cover/9780441013593");
            dune.setEditorsPick(true);
            dune.setPublisher("İthaki");
            dune.setPublicationYear(1965);
            dune.setPageCount(700);
            dune.setDescription("Çöl gezegeni Arrakis...");

            // Zorunlu alanlar
            dune.setBookType(BookType.PHYSICAL);
            dune.setTotalStock(5);
            dune.setAvailableStock(5);
            dune.setPrice(BigDecimal.valueOf(150.00));
            dune.setCreatedDate(LocalDateTime.now());

            // --- DÜZELTME: addCategory YERİNE setCategory ---
            dune.setCategory(bilimKurgu);

            bookRepository.save(dune);

            // 3. KİTAP 2: SEFİLLER
            Book sefiller = new Book();
            sefiller.setTitle("Sefiller");
            sefiller.setAuthor("Victor Hugo");
            sefiller.setIsbn("0987654321");
            sefiller.setImageUrl("https://m.media-amazon.com/images/I/51e7-f9dG+L.jpg");
            sefiller.setEditorsPick(false);
            sefiller.setPublisher("Can Yayınları");
            sefiller.setPublicationYear(1862);
            sefiller.setPageCount(1200);
            sefiller.setDescription("Jan Valjan'ın hikayesi...");

            // Zorunlu alanlar
            sefiller.setBookType(BookType.PHYSICAL);
            sefiller.setTotalStock(3);
            sefiller.setAvailableStock(3);
            sefiller.setPrice(BigDecimal.valueOf(200.00));
            sefiller.setCreatedDate(LocalDateTime.now().minusDays(5));

            // --- DÜZELTME: addCategory YERİNE setCategory ---
            sefiller.setCategory(dram);

            bookRepository.save(sefiller);

            System.out.println("--- DEMO VERİLERİ YÜKLENDİ ---");
        }
    }
}
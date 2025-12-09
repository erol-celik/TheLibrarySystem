package com.library.backend.config;

import com.library.backend.entity.*;
        import com.library.backend.entity.enums.BookType;
import com.library.backend.entity.enums.RentalStatus;
import com.library.backend.repository.*;
        import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
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
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TagRepository tagRepository;
    private final SeedingHelper seedingHelper; // <<< YENİ ENJEKSİYON

    private DataSeeder self;

    // Setter Injection metodu (Döngüyü kırmak için)
    @Autowired
    public void setSelf(DataSeeder self) {
        this.self = self;
    }
    
    @Override
    public void run(String... args) throws Exception {

        // 1. Tag ve Kategorilerin KAYDEDİLMESİNİ Zorla (Helper, Transaction'ı yönetir)
        seedingHelper.seedCategoriesIfEmpty();
        seedingHelper.seedTagsIfEmpty();

        // 2. Kitaplar YALNIZCA YOKSA KAYDEDİLMELİ
        if (bookRepository.count() == 0) {

            seedBooks();           // Kitapları oluştur ve kaydet


            self.assignTagsToBooks();   // Tagleri ata
            seedUsers();           // Kullanıcıları ata

            System.out.println("--- TÜM BAŞLANGIÇ VERİLERİ İŞLENDİ ---");
        }
    }

    private void seedBooks() {
        // 1. KATEGORİLER
        Category bilimKurgu = categoryRepository.findByName("Bilim Kurgu")
                .orElseThrow(() -> new RuntimeException("Kategori bulunamadı: Bilim Kurgu"));

        Category dram = categoryRepository.findByName("Dram")
                .orElseThrow(() -> new RuntimeException("Kategori bulunamadı: Dram"));

        Category felsefe = categoryRepository.findByName("Felsefe")
                .orElseThrow(() -> new RuntimeException("Kategori bulunamadı: Felsefe"));

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
        dune.setRentalStatus(RentalStatus.APPROVED);
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
        sefiller.setRentalStatus(RentalStatus.AVAILABLE);
        sefiller.setTotalStock(3);
        sefiller.setAvailableStock(3);
        sefiller.setPrice(BigDecimal.valueOf(200.00));
        sefiller.setCreatedDate(LocalDateTime.now().minusDays(5));

        // --- DÜZELTME: addCategory YERİNE setCategory ---
        sefiller.setCategory(dram);

        bookRepository.save(sefiller);

        // 4. KİTAP 3: HAYVAN ÇİFTLİĞİ
        Book hayvanCiftligi = new Book();
        hayvanCiftligi.setTitle("Hayvan Çiftliği");
        hayvanCiftligi.setAuthor("George Orwell");
        hayvanCiftligi.setIsbn("1122334455");
        hayvanCiftligi.setImageUrl("https://i.dr.com.tr/cache/500x400/originals/0000000106198-1.jpg");
        hayvanCiftligi.setEditorsPick(true); // Editörün seçimi olsun
        hayvanCiftligi.setPublisher("Can Yayınları");
        hayvanCiftligi.setPublicationYear(1945);
        hayvanCiftligi.setPageCount(152);
        hayvanCiftligi.setDescription("Siyasi hiciv türünde, hayvanlar üzerinden otorite eleştirisi.");
        hayvanCiftligi.setBookType(BookType.PHYSICAL);
        hayvanCiftligi.setRentalStatus(RentalStatus.APPROVED);
        hayvanCiftligi.setTotalStock(8);
        hayvanCiftligi.setAvailableStock(8);
        hayvanCiftligi.setPrice(BigDecimal.valueOf(85.50));
        hayvanCiftligi.setCreatedDate(LocalDateTime.now().minusDays(1));
        hayvanCiftligi.setCategory(dram);

        bookRepository.save(hayvanCiftligi);


        // 5. KİTAP 4: BÖYLE BUYURDU ZERDÜŞT
        Book zerdust = new Book();
        zerdust.setTitle("Böyle Buyurdu Zerdüşt");
        zerdust.setAuthor("Friedrich Nietzsche");
        zerdust.setIsbn("6677889900");
        zerdust.setImageUrl("https://m.media-amazon.com/images/I/41r8v7s47uL._SY445_SX342_.jpg");
        zerdust.setEditorsPick(false);
        zerdust.setPublisher("İş Bankası Yayınları");
        zerdust.setPublicationYear(1883);
        zerdust.setPageCount(500);
        zerdust.setDescription("Üstinsan kavramı ve ebedi tekerrür fikirleri üzerine.");
        zerdust.setBookType(BookType.DIGITAL); // Sadece E-book olarak ekleyelim
        zerdust.setRentalStatus(RentalStatus.AVAILABLE);
        zerdust.setTotalStock(1000); // Dijital olduğu için stok yüksek
        zerdust.setAvailableStock(1000);
        zerdust.setPrice(BigDecimal.valueOf(55.00));
        zerdust.setEbookFilePath("ebooks/zerdust.pdf"); // Dijital dosya yolu
        zerdust.setCreatedDate(LocalDateTime.now().minusDays(15));
        zerdust.setCategory(felsefe); // Yeni felsefe kategorisi

        bookRepository.save(zerdust);
        System.out.println("--- 4 Kitap Başarıyla Kataloğa Eklendi ---");
        System.out.println("--- DEMO VERİLERİ YÜKLENDİ ---");


    }

    // seedTags metodu artık yok, helper'a taşındı.

    @Transactional
    public void assignTagsToBooks() {
        // Tag'ler helper ile kaydedildiği için artık güvenle çekilebilir.
        Tag uzayTag = tagRepository.findByNameIgnoreCase("Uzay")
                .orElseThrow(() -> new RuntimeException("Tag 'Uzay' bulunamadı."));
        // ... Diğer Tag çekme işlemleri ...
        Tag politikTag = tagRepository.findByNameIgnoreCase("Politik")
                .orElseThrow(() -> new RuntimeException("Tag 'Politik' bulunamadı."));
        Tag varolussuTag = tagRepository.findByNameIgnoreCase("Varoluşçu")
                .orElseThrow(() -> new RuntimeException("Tag 'Varoluşçu' bulunamadı."));
        Tag epikTag = tagRepository.findByNameIgnoreCase("Epik")
                .orElseThrow(() -> new RuntimeException("Tag 'Epik' bulunamadı."));


        // ... Tag atama ve kaydetme mantığınız (bu kısım zaten doğru) ...
        bookRepository.findByTitleContainingIgnoreCase("Dune").stream().findFirst().ifPresent(dune -> {
            dune.addTag(uzayTag);
            dune.addTag(epikTag);
            bookRepository.save(dune);
        });

        bookRepository.findByTitleContainingIgnoreCase("Hayvan Çiftliği").stream().findFirst().ifPresent(hayvanCiftligi -> {
            hayvanCiftligi.addTag(politikTag);
            hayvanCiftligi.addTag(epikTag);
            bookRepository.save(hayvanCiftligi);
        });

        bookRepository.findByTitleContainingIgnoreCase("Zerdüşt").stream().findFirst().ifPresent(zerdust -> {
            zerdust.addTag(varolussuTag);
            bookRepository.save(zerdust);
        });
    }

    @Transactional
    private void seedUsers() {
        if (userRepository.findByEmail("test@mail.com").isEmpty()) {
            User testUser = new User();
            testUser.setName("Test Kullanıcısı");
            testUser.setEmail("test@mail.com");
            testUser.setPassword("test1234");
            User savedUser = userRepository.save(testUser);
            createInitialWallet(savedUser);
            System.out.println("--- YAPAY KULLANICI EKLENDİ: test@mail.com (test1234) ---");
        }
    }

    private void createInitialWallet(User user) {
        // MANTIK HATASI DÜZELTİLDİ: Yalnızca cüzdan yoksa oluştur.
        if (walletRepository.findByUser(user).isEmpty()) {
            Wallet wallet = new Wallet();
            wallet.setUser(user);
            wallet.setBalance(BigDecimal.valueOf(100.00));
            walletRepository.save(wallet);
        }
    }
    // seedCategories metodu artık yok, helper'a taşındı.
}
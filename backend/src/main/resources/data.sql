-- ============================================================
-- 1. KATEGORİLER
-- "INSERT IGNORE": Eğer ID=1 varsa hata verme, geç. Yoksa ekle.
-- ============================================================
INSERT IGNORE INTO categories (id, name, created_at, updated_at) VALUES
(1, 'Bilim Kurgu', NOW(), NOW()),
(2, 'Dram', NOW(), NOW()),
(3, 'Felsefe', NOW(), NOW()),
(4, 'Tarih', NOW(), NOW()),
(5, 'Korku', NOW(), NOW());

-- ============================================================
-- 2. ETİKETLER (Blind Date Algoritması İçin)
-- ============================================================
INSERT IGNORE INTO tags (id, name, created_at, updated_at) VALUES
(1, 'Akıl Büken', NOW(), NOW()),
(2, 'Yağmurlu Gün Okuması', NOW(), NOW()),
(3, 'Distopik Kabus', NOW(), NOW()),
(4, 'Tarihe Yolculuk', NOW(), NOW()),
(5, 'Ağlatan Son', NOW(), NOW()),
(6, 'Hızlı Tüketilen', NOW(), NOW()),
(7, 'Felsefi Derinlik', NOW(), NOW());

-- ============================================================
-- 3. ROZETLER (Gamification)
-- ============================================================
INSERT IGNORE INTO badges (id, name, title, description, icon_path, created_at, updated_at) VALUES
(1, 'BOOK_WORM', 'Kitap Kurdu', '5 kitap kiralayıp zamanında teslim ettin.', 'assets/badges/worm.png', NOW(), NOW()),
(2, 'NIGHT_OWL', 'Gece Kuşu', 'Gece yarısından sonra kitap kiraladın.', 'assets/badges/owl.png', NOW(), NOW()),
(3, 'CRITIC', 'Acımasız Eleştirmen', 'İlk yorumunu yaptın.', 'assets/badges/critic.png', NOW(), NOW()),
(4, 'SUPPORTER', 'Hayırsever', 'Kütüphaneye kitap bağışladın.', 'assets/badges/heart.png', NOW(), NOW()),
(5, 'RICHIE_RICH', 'Cüzdan Kabarık', 'Cüzdana tek seferde 500 TL yükledin.', 'assets/badges/money.png', NOW(), NOW());

-- ============================================================
-- 4. KULLANICILAR
-- Şifre: "123" (BCrypt Hash: $2a$10$N.zmdr9k7uOCQb376ye.5.Z6rLoIsC.AzClj66jENOmkyG.h.e.Ay)
-- Senin gönderdiğin hash ile değiştirdim, bu hash kesinlikle '123'tür.
-- ============================================================
INSERT IGNORE INTO users (id, email, password, name, avatar_url, bio, is_banned, created_at, updated_at) VALUES
(1, 'admin@library.com', '$2a$10$N.zmdr9k7uOCQb376ye.5.Z6rLoIsC.AzClj66jENOmkyG.h.e.Ay', 'Patron Admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', 'Sistemin tek hakimi.',  false, NOW(), NOW()),
(2, 'lib@library.com', '$2a$10$N.zmdr9k7uOCQb376ye.5.Z6rLoIsC.AzClj66jENOmkyG.h.e.Ay', 'Hüseyin Kütüphaneci', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lib', 'Kitapların efendisi.',  false, NOW(), NOW()),
(3, 'ali@mail.com', '$2a$10$N.zmdr9k7uOCQb376ye.5.Z6rLoIsC.AzClj66jENOmkyG.h.e.Ay', 'Ali Yılmaz', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ali', 'Bilgisayar mühendisliği öğrencisi. Bilim kurgu sever.',  false, NOW(), NOW()),
(4, 'ayse@mail.com', '$2a$10$N.zmdr9k7uOCQb376ye.5.Z6rLoIsC.AzClj66jENOmkyG.h.e.Ay', 'Ayşe Demir', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ayse', 'Sadece dram okurum.',  false, NOW(), NOW()),
(5, 'mehmet@mail.com', '$2a$10$N.zmdr9k7uOCQb376ye.5.Z6rLoIsC.AzClj66jENOmkyG.h.e.Ay', 'Mehmet Banlı', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mehmet', 'Kuralları sevmem.',  true, NOW(), NOW());

-- ============================================================
-- 5. KULLANICI ROLLERİ (RBAC)
-- Kullanıcı Login olabilse bile, burası olmazsa "Yetkin Yok" der.
-- ============================================================
INSERT IGNORE INTO user_roles (user_id, role) VALUES
(1, 'ADMIN'),
(2, 'LIBRARIAN'),
(3, 'USER'),
(4, 'USER'),
(5, 'USER');

-- ============================================================
-- 6. CÜZDANLAR
-- ============================================================
INSERT IGNORE INTO wallet (wallet_id, user_id, balance) VALUES
(1, 1, 0.00),     -- Admin
(2, 2, 0.00),     -- Librarian
(3, 3, 450.50),   -- Ali (Parası var)
(4, 4, 20.00),    -- Ayşe (Fakir)
(5, 5, 0.00);     -- Mehmet

-- ============================================================
-- 7. KİTAPLAR
-- rental_status: 'APPROVED' varsayılan olarak eklendi.
-- ============================================================
INSERT IGNORE INTO books (id, title, author, isbn, publisher, publication_year, page_count, description, image_url, book_type, price, ebook_file_path, total_stock, available_stock, is_editors_pick, category_id, created_at, updated_at, rental_status) VALUES
-- FİZİKSEL
(1, 'Dune', 'Frank Herbert', '9780441013593', 'İthaki Yayınları', 1965, 896, 'Çöl gezegeni Arrakis efsanesi.', 'https://images-na.ssl-images-amazon.com/images/I/915MSd57WLL.jpg', 'PHYSICAL', 250.00, NULL, 5, 4, true, 1, NOW(), NOW(), 'APPROVED'),
(2, '1984', 'George Orwell', '9780451524935', 'Can Yayınları', 1949, 328, 'Büyük Birader izliyor.', 'https://images-na.ssl-images-amazon.com/images/I/71kxa1-0mfL.jpg', 'PHYSICAL', 120.00, NULL, 10, 10, true, 1, NOW(), NOW(), 'APPROVED'),
(3, 'Sefiller', 'Victor Hugo', '9780451419439', 'İş Bankası', 1862, 1463, 'Jan Valjan hikayesi.', 'https://images-na.ssl-images-amazon.com/images/I/81cSt+295-L.jpg', 'PHYSICAL', 350.00, NULL, 3, 2, false, 2, NOW(), NOW(), 'APPROVED'),
(4, 'Suç ve Ceza', 'Fyodor Dostoyevsky', '9780140449136', 'Can Yayınları', 1866, 671, 'Raskolnikov vicdanı.', 'https://images-na.ssl-images-amazon.com/images/I/81WcnNQ-TBL.jpg', 'PHYSICAL', 180.00, NULL, 6, 6, false, 2, NOW(), NOW(), 'APPROVED'),
(5, 'Cosmos', 'Carl Sagan', '9780345331309', 'Altın Kitaplar', 1980, 365, 'Bilimsel yolculuk.', 'https://images-na.ssl-images-amazon.com/images/I/91w4Fk+-L5L.jpg', 'PHYSICAL', 200.00, NULL, 2, 2, true, 1, NOW(), NOW(), 'APPROVED'),
(6, 'Nutuk', 'Mustafa Kemal Atatürk', '9789750829923', 'YKY', 1927, 1197, 'Cumhuriyetin kuruluşu.', 'https://i.dr.com.tr/cache/600x600/0/0001897486001.jpg', 'PHYSICAL', 150.00, NULL, 100, 99, true, 4, NOW(), NOW(), 'APPROVED'),

-- DİJİTAL
(7, 'The Time Machine', 'H.G. Wells', 'DIGITAL-001', 'Gutenberg', 1895, 118, 'Zaman yolculuğu.', 'https://images-na.ssl-images-amazon.com/images/I/612V88n6pML.jpg', 'DIGITAL', 45.00, 'https://www.gutenberg.org/files/35/35-pdf.pdf', 9999, 9999, false, 1, NOW(), NOW(), 'APPROVED'),
(8, 'Frankenstein', 'Mary Shelley', 'DIGITAL-002', 'Gutenberg', 1818, 280, 'Modern Prometheus.', 'https://images-na.ssl-images-amazon.com/images/I/81z7E0uWdtL.jpg', 'DIGITAL', 50.00, 'https://www.gutenberg.org/files/84/84-pdf.pdf', 9999, 9999, false, 5, NOW(), NOW(), 'APPROVED'),
(9, 'Devlet', 'Platon', 'DIGITAL-003', 'Gutenberg', -375, 400, 'İdeal devlet.', 'https://images-na.ssl-images-amazon.com/images/I/41-JgTzF8RL._SX331_BO1,204,203,200_.jpg', 'DIGITAL', 30.00, 'https://www.gutenberg.org/cache/epub/1497/pg1497.pdf', 9999, 9999, false, 3, NOW(), NOW(), 'APPROVED');

-- ============================================================
-- 8. KİTAP - ETİKET EŞLEŞTİRMELERİ
-- ============================================================
INSERT IGNORE INTO book_tags (book_id, tag_id) VALUES
(1, 1), (1, 3), -- Dune
(2, 3), (2, 5), -- 1984
(3, 5), (3, 2), -- Sefiller
(7, 1), (7, 6); -- Time Machine

-- ============================================================
-- 9. KİRALAMA GEÇMİŞİ
-- ============================================================
INSERT IGNORE INTO rentals (id, user_id, book_id, rent_date, due_date, return_date, status, penalty_fee, created_at, updated_at) VALUES
(1, 3, 1, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), 'RETURNED', 0.00, NOW(), NOW()),
(2, 4, 3, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY), NULL, 'APPROVED', 0.00, NOW(), NOW());

-- ============================================================
-- 10. YORUMLAR
-- ============================================================
INSERT IGNORE INTO reviews (id, user_id, book_id, stars, comment, is_spoiler, helpful_count, created_at, updated_at) VALUES
(1, 3, 1, 5, 'Başyapıt. Filmi yanında sönük kalır.', false, 10, NOW(), NOW()),
(2, 1, 1, 4, 'Dünyası inanılmaz.', false, 2, NOW(), NOW()),
(3, 3, 7, 5, 'Kısa ama ufuk açıcı.', false, 0, NOW(), NOW());

-- ============================================================
-- 11. ROZET KAZANIMLARI
-- ============================================================
INSERT IGNORE INTO user_badges (id, user_id, badge_id, earned_at, created_at, updated_at) VALUES
(1, 3, 1, NOW(), NOW(), NOW()), -- Ali: Kitap Kurdu
(2, 3, 3, NOW(), NOW(), NOW()); -- Ali: Eleştirmen
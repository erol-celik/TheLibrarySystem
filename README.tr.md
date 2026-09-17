# The Library System (BookHub)

Kullanıcıların kitap kiralayabildiği, satın alabildiği, satabildiği, bağışlayabildiği, yorum yapabildiği ve uygulama içi cüzdanını yönetebildiği bir tam yığın (full-stack) kütüphane yönetim platformu. Kütüphaneciler ve yöneticiler için içerik moderasyonu, bağış takibi ve platform istatistiklerini görüntüleme amaçlı özel panolar bulunur.

## Teknoloji Yığını

**Backend**
- Java 21, Spring Boot 3.4 (Web, Data JPA, Security, Validation)
- MySQL 8
- JWT tabanlı kimlik doğrulama (`jjwt`)
- Maven

**Frontend**
- React + TypeScript, Vite ile derlenir
- React Router
- Radix UI bileşenleri + Tailwind (`class-variance-authority`, `tailwind-merge` üzerinden)
- Axios, React Hook Form, Recharts

**Altyapı**
- Docker Compose (MySQL + backend + frontend konteynerleri)

## Proje Yapısı

```
BookHub/
├── backend/         # Spring Boot REST API
├── frontend/        # React + Vite tek sayfa uygulaması
├── data.sql         # Veritabanı için başlangıç (seed) verisi
├── mock.py          # Mock/seed veri üretmek için kullanılan script
├── .env.example     # Gerekli ortam değişkenlerinin şablonu (.env olarak kopyalayın)
└── docker-compose.yml
```

## Ön Koşullar

- Java 21+ ve Maven (veya dahili `mvnw` wrapper'ı — not: bu repoda wrapper'ın destek dosyaları eksik, aşağıya bakın)
- Node.js 18+ ve npm
- Docker ve Docker Compose (konteynerli kurulum için)

## Başlarken

### 1. Gizli bilgileri yapılandırın

`.env.example` dosyasını `.env` olarak kopyalayın ve `DB_PASSWORD` ile `JWT_SECRET` alanlarını kendi değerlerinizle doldurun:

```bash
cp .env.example .env
```

Bu değerler hem `docker-compose.yml` hem de backend (`application.properties`) tarafından ortam değişkeni olarak okunur — aşağıdaki [Yapılandırma](#yapılandırma) bölümüne bakın.

### 2. Seçenek A: Docker Compose (önerilen)

```bash
docker-compose up --build
```

Bu komut MySQL'i, backend API'yi (port `8080`) ve frontend geliştirme sunucusunu (port `3000`) `.env`'deki değerlerle başlatır.

### 2. Seçenek B: Servisleri yerel olarak çalıştırma

**Backend**

```bash
cd backend
./mvnw spring-boot:run
```

> Not: Maven wrapper'ının destek dosyaları (`.mvn/wrapper/`) bu repoda şu anda mevcut değil. `./mvnw` başarısız olursa, yerel olarak Maven kurup `mvn spring-boot:run` komutunu kullanabilir ya da `mvn -N wrapper:wrapper` ile wrapper'ı yeniden oluşturabilirsiniz.

`application.properties`, `${DB_PASSWORD}` ve `${JWT_SECRET}` değerlerini ortam değişkenlerinden okuduğu için, yerel çalıştırmada (Docker Compose dışında) aynı değerleri `.env`'den kendi shell'inize aktarmanız gerekir, örn. macOS/Linux'ta `export $(cat .env | xargs)`.

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## Kullanılabilir Komutlar (frontend)

| Komut | Açıklama |
|---|---|
| `npm run dev` | Vite geliştirme sunucusunu başlatır |
| `npm run build` | Üretim (production) derlemesi oluşturur |
| `npm run lint` | ESLint çalıştırır |
| `npm run preview` | Üretim derlemesini yerel olarak önizler |

## Yapılandırma

Veritabanı kimlik bilgileri ve JWT imzalama anahtarı koda gömülü **değildir** — hem `docker-compose.yml` hem de `application.properties` bunları ortam değişkenlerinden (`DB_PASSWORD`, `JWT_SECRET`) okur; bu değerler yerel, git'e eklenmeyen bir `.env` dosyasından (commit edilmez) gelir. Gerekli anahtarlar için `.env.example`'a bakın. Yerel dışı herhangi bir dağıtım için bu değerleri, commit'lenen bir `.env` dosyası yerine platformunuzun kendi secrets mekanizmasıyla ayarlayın.

## Lisans

Bu repoda şu anda bir lisans dosyası bulunmamaktadır. Bir lisans eklenmediği sürece tüm haklar yazara aittir.

package com.library.backend.service;

import com.library.backend.dto.book.AddBookRequest;
import com.library.backend.dto.book.BlindDateBookResponse;
import com.library.backend.dto.book.BookResponse;
import com.library.backend.entity.Book;
import com.library.backend.entity.Category;
import com.library.backend.entity.Tag;
import com.library.backend.entity.enums.BookType;
import com.library.backend.entity.enums.RentalStatus;
import com.library.backend.repository.BookRepository;
import com.library.backend.repository.CategoryRepository;
import com.library.backend.repository.TagRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final TagRepository tagRepository;
    private final CategoryRepository categoryRepository;
    // --- CONSTRUCTOR INJECTION (Manuel ve Garantili) ---
    @Autowired // Spring'e "Bunu kullan" diyoruz
    public BookService(BookRepository bookRepository, TagRepository tagRepository, CategoryRepository categoryRepository) {
        this.bookRepository = bookRepository;
        this.tagRepository = tagRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<BookResponse> getNewArrivals() {
        List<Book> books = bookRepository.findTop10ByOrderByCreatedDateDesc();
        return convertToDtoList(books);
    }

    public List<BookResponse> getEditorsChoice() {
        List<Book> books = bookRepository.findByIsEditorsPickTrue();
        return convertToDtoList(books);
    }

    public List<BookResponse> getAllBooks() {
        List<Book> activeBooks = bookRepository.findAll().stream()
                .filter(Book::isActive)
                .collect(Collectors.toList());
        return convertToDtoList(activeBooks);
    }



    @Transactional
    public BlindDateBookResponse getBlindDateBookByTag(String tagName) {
        // 1. Tag Adı ile Tag Entity'sini bulma
        Tag tag = tagRepository.findByNameIgnoreCase(tagName.trim())
                .orElseThrow(() -> new RuntimeException("Geçersiz etiket adı: " + tagName));

        // 2. Tag'in sahip olduğu kitap listesini alma
        // Bu, eğer Tag Entity'nizde List<Book> books alanı varsa çalışacaktır.
        Set<Book> candidateBookSet = tag.getBooks();
        List<Book> candidateBooksList = new ArrayList<>(candidateBookSet);
        // 3. Kontrol: Eğer hiç kitap yoksa hata döndür
        if (candidateBooksList.isEmpty()) {
            throw new RuntimeException("'" + tagName + "' etiketiyle eşleşen kitap bulunamadı.");
        }
        List<Book> activeBooksList = candidateBooksList.stream()
                .filter(Book::isActive)
                .collect(Collectors.toList());
        // 4. Rastgele Kitap Seçimi
        Random random = new Random();
        Book selectedBook = activeBooksList.get(random.nextInt(activeBooksList.size()));

        // 5. DTO'ya dönüştür ve döndür (Maskeleme)
        return mapToBlindDateResponse(selectedBook);
    }
    public List<BookResponse> searchBooks(String keyword) {
        // 1. Keyword kontrolü: Arama kelimesi boş veya çok kısaysa boş liste dön
        if (keyword == null || keyword.trim().length() < 2) {
            return Collections.emptyList();
        }
        List<Book> books = bookRepository.findByTitleContainingIgnoreCase(keyword.trim());
        // 2. Repository metodu çağrılır.
        // findByTitleContainingIgnoreCase metodu BookRepository'de tanımlanmalıdır.
        // Bu metot, başlıkta keyword'ü içeren, büyük/küçük harfe bakılmaksızın tüm kitapları çeker.
        List<Book> activeBooks = books.stream()
                .filter(Book::isActive)
                .collect(Collectors.toList());
        return convertToDtoList(activeBooks);
    }

    public List<BookResponse> searchBooksByAuthor(String keyword) {
        // 1. Keyword kontrolü: Arama kelimesi boş veya çok kısaysa boş liste dön
        if (keyword == null || keyword.trim().length() < 2) {
            return Collections.emptyList();
        }
        List<Book> books = bookRepository.findByAuthorIgnoreCase(keyword.trim());
        // 2. Repository metodu çağrılır.
        // findByTitleContainingIgnoreCase metodu BookRepository'de tanımlanmalıdır.
        // Bu metot, başlıkta keyword'ü içeren, büyük/küçük harfe bakılmaksızın tüm kitapları çeker.
        List<Book> activeBooks = books.stream()
                .filter(Book::isActive)
                .collect(Collectors.toList());
        return convertToDtoList(activeBooks);
    }


    public List<BookResponse> searchBooksByStatus(RentalStatus keyword) {
        // 1. Keyword kontrolü: Arama kelimesi boş veya çok kısaysa boş liste dön
        if (keyword == null ) {
            return Collections.emptyList();
        }
        List<Book> books = bookRepository.findByRentalStatus(keyword);
        // 2. Repository metodu çağrılır.
        // findByTitleContainingIgnoreCase metodu BookRepository'de tanımlanmalıdır.
        // Bu metot, başlıkta keyword'ü içeren, büyük/küçük harfe bakılmaksızın tüm kitapları çeker.
        List<Book> activeBooks = books.stream()
                .filter(Book::isActive)
                .collect(Collectors.toList());
        return convertToDtoList(activeBooks);
    }

    public List<BookResponse> searchBooksByBookType(BookType keyword) {
        // 1. Keyword kontrolü: Arama kelimesi boş veya çok kısaysa boş liste dön
        if (keyword == null ) {
            return Collections.emptyList();
        }
        List<Book> books = bookRepository.findByBookType(keyword);
        // 2. Repository metodu çağrılır.
        // findByTitleContainingIgnoreCase metodu BookRepository'de tanımlanmalıdır.
        // Bu metot, başlıkta keyword'ü içeren, büyük/küçük harfe bakılmaksızın tüm kitapları çeker.
        List<Book> activeBooks = books.stream()
                .filter(Book::isActive)
                .collect(Collectors.toList());
        return convertToDtoList(activeBooks);
    }

    public BookResponse addBook(AddBookRequest request){
        Book newBook = new Book();
        newBook.setTitle(request.getTitle());
        newBook.setAuthor(request.getAuthor());
        newBook.setBookType(request.getBookType());
        newBook.setPublisher(request.getPublisher());
        newBook.setDescription(request.getDescription());
        newBook.setPublicationYear(request.getPublicationYear());
        newBook.setIsbn(request.getIsbn());
        newBook.setPageCount(request.getPageCount());
        newBook.setPrice(request.getPrice());
        newBook.setImageUrl(request.getImageUrl());
        if(request.getBookType() == BookType.DIGITAL){
            newBook.setAvailableStock(Integer.MAX_VALUE);
            newBook.setTotalStock(Integer.MAX_VALUE);
        }else{
            newBook.setAvailableStock(request.getTotalStock());
            newBook.setTotalStock(request.getTotalStock());
        }

        newBook.setRentalStatus(RentalStatus.AVAILABLE);

        Category category = categoryRepository.findByName(request.getCategory())
                .orElseThrow(() -> new RuntimeException("Kategori bulunamadı"));
        newBook.setCategory(category);

        newBook.setEbookFilePath(request.getEbookFilePath());
        newBook.setActive(true);
        Set<Tag> tags = request.getTags().stream()
                .map(tagName -> tagRepository.findByName(tagName)
                        .orElseThrow(() -> new IllegalArgumentException("Etiket bulunamadı: " + tagName)))
                .collect(Collectors.toSet());
        newBook.setTags(tags);

        bookRepository.save(newBook);
        return mapToResponse(newBook);
    }

// BookService.java

// ... gerekli importlar (Optional, IllegalArgumentException, BookNotFoundException, BookResponse)

    public BookResponse deleteBookByIsbn(String isbn) {

        // 1. Kitabı ISBN'e göre bul
        Book bookToDelete = bookRepository.findByIsbn(isbn);
        // Burada IllegalArgumentException kullanarak 400 Bad Request döndürüyoruz.

        // 2. KRİTİK KONTROL: Stok Durumu
        // Kitap silinmeden önce kiralanmış kopyaları olmamalıdır.
        if (bookToDelete.getTotalStock() != bookToDelete.getAvailableStock()) {
            throw new IllegalStateException("Kitap silinemez: Tüm kopyalar iade edilmeden silme işlemi yapılamaz.");
            // IllegalStateException kullanarak 409 Conflict veya 500 Internal Server Error döndürülebilir.
        }

        // 3. Yanıt DTO'sunu Kaydet (Silinmeden önceki veriler)
        // Silinmiş Book Entity'sini döndürmek mantıklı olmadığı için,
        // silinmeden önce Response DTO'sunu oluştururuz.
        BookResponse response = mapToResponse(bookToDelete); // Farz edelim bu metot var

        // 4. Soft Silme İşlemi
        bookToDelete.setActive(false);
        bookRepository.save(bookToDelete);
        // 5. Yanıtı döndür
        return response;
    }
    // --- Helper Metotlar ---
    //listi dto liste çevirir
    private List<BookResponse> convertToDtoList(List<Book> books) {
        return books.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private BookResponse mapToResponse(Book book) {
        BookResponse response = new BookResponse();
        // Manuel Getter/Setter kullanımı
        response.setDescription(book.getDescription());
        response.setIsbn(book.getIsbn());
        response.setPublisher(book.getPublisher());
        response.setTitle(book.getTitle());
        response.setAuthor(book.getAuthor());
        response.setImageUrl(book.getImageUrl());
        response.setEditorsPick(book.isEditorsPick());
        response.setPublicationYear(book.getPublicationYear());
        response.setStatus(book.getRentalStatus());
        response.setPageCount(book.getPageCount());
        response.setBookType(book.getBookType());
        response.setPrice(book.getPrice());
        response.setEbookFilePath(book.getEbookFilePath());
        response.setAvailableStock(book.getAvailableStock());

        // Kategori String Birleştirme (Daha önce yazdığımız kod)
        String categoryName = "Genel";

        if (book.getCategory() != null) {
            categoryName = book.getCategory().getName();
        }
        Set<String> tagNames = new HashSet<>();
        if (book.getTags() != null) {
            tagNames.addAll(
                    book.getTags().stream()
                            .map(Tag::getName) // SADECE ADINI ÇEKİYORUZ!
                            .collect(Collectors.toSet())
            );
        }
        response.setTags(tagNames);
        response.setCategoryName(categoryName);

        return response;
    }

    private BlindDateBookResponse mapToBlindDateResponse(Book book){
        BlindDateBookResponse dto = new BlindDateBookResponse();
        dto.setDescription(book.getDescription());
        Set<String> tagNames = new HashSet<>();
        if (book.getTags() != null) {
            tagNames.addAll(
                    book.getTags().stream()
                            .map(Tag::getName) // SADECE ADINI ÇEKİYORUZ!
                            .collect(Collectors.toSet())
            );
        }

        dto.setVibeTags(tagNames);

        return dto;
    }


}
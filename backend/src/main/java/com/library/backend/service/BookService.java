package com.library.backend.service;

import com.library.backend.dto.book.AddBookRequest;
import com.library.backend.dto.book.BlindDateBookResponse;
import com.library.backend.dto.book.BookFilterRequest;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
        List<Book> activeBooks = bookRepository.findTop10ByOrderByCreatedDateDesc().stream()
                .filter(Book::isActive)
                .collect(Collectors.toList());
        return convertToDtoList(activeBooks);
    }

    public List<BookResponse> getEditorsChoice() {
        List<Book> activeBooks = bookRepository.findByIsEditorsPickTrue().stream()
                .filter(Book::isActive)
                .collect(Collectors.toList());
        return convertToDtoList(activeBooks);
    }

    public List<BookResponse> getAllBooks() {
        List<Book> activeBooks = bookRepository.findAll().stream()
                .filter(Book::isActive)
                .collect(Collectors.toList());
        return convertToDtoList(activeBooks);
    }

    public List<Map<String, String>> getAllCategoriesForFrontend() {
        return categoryRepository.findAll().stream()
                .map(c -> Map.of("name", c.getName()))
                .collect(Collectors.toList());
    }

    public Page<BookResponse> getFilteredBooks(BookFilterRequest request) {
        // Sıralama (Sort) mantığı burada kuruluyor
        String keyword = (request.getKeyword() != null && !request.getKeyword().isBlank()) ? request.getKeyword() : null;
        String category = (request.getCategory() != null && !request.getCategory().isBlank()) ? request.getCategory() : null;

        Sort sort = Sort.by(
                request.getDirection().equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
                request.getSortBy()
        );

        PageRequest pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        Page<Book> booksPage = bookRepository.searchBooks(
                keyword,   // request.getKeyword() yerine keyword
                category,  // request.getCategory() yerine category
                request.getAvailable(),
                pageable
        );

        // 3. PageImpl uyarısını çözen kısım: Entity'yi DTO'ya map'liyoruz
        return booksPage.map(this::mapToResponse);
    }

    @Transactional
    public BlindDateBookResponse getBlindDateBookByTag(String tagName) {
        // 1. Tag Adı ile Tag Entity'sini bulma
        Tag tag = tagRepository.findByNameIgnoreCase(tagName.trim())
                .orElseThrow(() -> new RuntimeException("Invalid tag name: " + tagName));

        // 2. Tag'in sahip olduğu kitap listesini alma
        // Bu, eğer Tag Entity'nizde List<Book> books alanı varsa çalışacaktır.
        Set<Book> candidateBookSet = tag.getBooks();
        List<Book> candidateBooksList = new ArrayList<>(candidateBookSet);

        // 3. Kontrol: Eğer hiç kitap yoksa hata döndür
        if (candidateBooksList.isEmpty()) {
            throw new RuntimeException("No books found matching tag: " + tagName);
        }

        List<Book> activeBooksList = candidateBooksList.stream()
                .filter(Book::isActive)
                .collect(Collectors.toList());

        // Eğer aktif kitap yoksa yine hata verilmeli (boş liste hatası almamak için)
        if (activeBooksList.isEmpty()) {
            throw new RuntimeException("No active books found matching tag: " + tagName);
        }

        // 4. Rastgele Kitap Seçimi
        Random random = new Random();
        Book selectedBook = activeBooksList.get(random.nextInt(activeBooksList.size()));

        // 5. DTO'ya dönüştür ve döndür (Maskeleme)
        return mapToBlindDateResponse(selectedBook);
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

        // KATEGORİ DÜZELTMESİ: Artık liste olduğu için addCategory kullanıyoruz.
        // request.getCategories() bir Set<String> dönüyor, her birini bulup ekliyoruz.
        if (request.getCategories() != null) {
            for (String catName : request.getCategories()) {
                Category category = categoryRepository.findByName(catName)
                        .orElseThrow(() -> new RuntimeException("Category not found: " + catName));
                newBook.addCategory(category); // DÜZELTİLDİ: Entity içindeki helper metod
            }
        }

        newBook.setEbookFilePath(request.getEbookFilePath());
        newBook.setActive(true);

        Set<Tag> tags = request.getTags().stream()
                .map(tagName -> tagRepository.findByName(tagName)
                        .orElseThrow(() -> new IllegalArgumentException("Tag not found: " + tagName)))
                .collect(Collectors.toSet());
        newBook.setTags(tags);

        bookRepository.save(newBook);
        return mapToResponse(newBook);
    }

    public BookResponse deleteBookByIsbn(String isbn) {

        // 1. Kitabı ISBN'e göre bul
        Book bookToDelete = bookRepository.findByIsbn(isbn);
        // Burada repository null dönerse kontrol gerekebilir, şimdilik varsayılan akışta bırakıyoruz.

        // 2. KRİTİK KONTROL: Stok Durumu
        // Kitap silinmeden önce kiralanmış kopyaları olmamalıdır.
        if (bookToDelete.getTotalStock() != bookToDelete.getAvailableStock()) {
            throw new IllegalStateException("Book cannot be deleted: All copies must be returned before deletion.");
            // IllegalStateException kullanarak 409 Conflict veya 500 Internal Server Error döndürülebilir.
        }

        // 3. Yanıt DTO'sunu Kaydet (Silinmeden önceki veriler)
        // Silinmiş Book Entity'sini döndürmek mantıklı olmadığı için,
        // silinmeden önce Response DTO'sunu oluştururuz.
        BookResponse response = mapToResponse(bookToDelete);

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
        response.setRating(book.getRating());
        response.setReviewCount(book.getReviewCount());

        // Kategori DÜZELTMESİ
        // Artık book.getCategory() yok, book.getCategories() var.
        Set<String> categoryNames = new HashSet<>();
        if (book.getCategories() != null) {
            categoryNames = book.getCategories().stream()
                    .map(Category::getName)
                    .collect(Collectors.toSet());
        }
        // DTO tarafını da Set<String> categories olarak değiştirdiğin için burası uyumlu hale geldi.
        response.setCategories(categoryNames);

        Set<String> tagNames = new HashSet<>();
        if (book.getTags() != null) {
            tagNames.addAll(
                    book.getTags().stream()
                            .map(Tag::getName) // SADECE ADINI ÇEKİYORUZ!
                            .collect(Collectors.toSet())
            );
        }
        response.setTags(tagNames);

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
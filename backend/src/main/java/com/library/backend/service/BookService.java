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
import com.library.backend.specification.BookSpecification;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final TagRepository tagRepository;
    private final CategoryRepository categoryRepository;

    @Autowired
    public BookService(BookRepository bookRepository, TagRepository tagRepository,
            CategoryRepository categoryRepository) {
        this.bookRepository = bookRepository;
        this.tagRepository = tagRepository;
        this.categoryRepository = categoryRepository;
    }

    // --- YENİ EKLENEN DİNAMİK SORGULAMA METODU ---
    public Page<BookResponse> searchBooksDynamic(
            String title,
            String author,
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable) {
        // 1. Başlangıçta boş bir kural (SELECT * FROM books)
        Specification<Book> spec = Specification.where(null);

        // 2. Parametreler geldikçe kuralları zincirleme ekle
        if (title != null) {
            spec = spec.and(BookSpecification.hasTitle(title));
        }
        if (author != null) {
            spec = spec.and(BookSpecification.hasAuthor(author));
        }
        if (category != null) {
            spec = spec.and(BookSpecification.hasCategory(category));
        }
        if (minPrice != null || maxPrice != null) {
            spec = spec.and(BookSpecification.priceBetween(minPrice, maxPrice));
        }

        // 3. Veritabanında çalıştır ve DTO'ya çevir
        return bookRepository.findAll(spec, pageable)
                .map(this::mapToResponse);
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
        List<Book> books = bookRepository.findAll();
        return books.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<Map<String, String>> getAllCategoriesForFrontend() {
        return categoryRepository.findAll().stream()
                .map(c -> Map.of("name", c.getName()))
                .collect(Collectors.toList());
    }

    public List<String> getAllTags() {
        return tagRepository.findAll().stream()
                .map(Tag::getName)
                .collect(Collectors.toList());
    }

    // Eski filtreleme metodu (Hala kullanımda olabilir diye tutuyoruz ama Dynamic
    // olanı öneriyoruz)
    public Page<BookResponse> getFilteredBooks(BookFilterRequest request) {
        String keyword = (request.getKeyword() != null && !request.getKeyword().isBlank()) ? request.getKeyword()
                : null;
        String category = (request.getCategory() != null && !request.getCategory().isBlank()) ? request.getCategory()
                : null;

        Sort sort = Sort.by(
                request.getDirection().equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
                request.getSortBy());

        PageRequest pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        Page<Book> booksPage = bookRepository.searchBooks(
                keyword,
                category,
                request.getAvailable(),
                pageable);

        return booksPage.map(this::mapToResponse);
    }

    @Transactional
    public BlindDateBookResponse getBlindDateBookByTag(String tagName) {
        Tag tag = tagRepository.findByNameIgnoreCase(tagName.trim())
                .orElseThrow(() -> new RuntimeException("Invalid tag name: " + tagName));

        Set<Book> candidateBookSet = tag.getBooks();
        List<Book> candidateBooksList = new ArrayList<>(candidateBookSet);

        if (candidateBooksList.isEmpty()) {
            throw new RuntimeException("No books found matching tag: " + tagName);
        }

        List<Book> activeBooksList = candidateBooksList.stream()
                .filter(Book::isActive)
                .collect(Collectors.toList());

        if (activeBooksList.isEmpty()) {
            throw new RuntimeException("No active books found matching tag: " + tagName);
        }

        Random random = new Random();
        Book selectedBook = activeBooksList.get(random.nextInt(activeBooksList.size()));

        return mapToBlindDateResponse(selectedBook);
    }

    public BookResponse addBook(AddBookRequest request) {
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

        if (request.getBookType() == BookType.DIGITAL) {
            newBook.setAvailableStock(Integer.MAX_VALUE);
            newBook.setTotalStock(Integer.MAX_VALUE);
        } else {
            newBook.setAvailableStock(request.getTotalStock());
            newBook.setTotalStock(request.getTotalStock());
        }

        newBook.setRentalStatus(RentalStatus.AVAILABLE);

        if (request.getCategories() != null) {
            for (String catName : request.getCategories()) {
                Category category = categoryRepository.findByName(catName)
                        .orElseThrow(() -> new RuntimeException("Category not found: " + catName));
                newBook.addCategory(category);
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
        Book bookToDelete = bookRepository.findByIsbn(isbn);
        if (bookToDelete.getTotalStock() != bookToDelete.getAvailableStock()) {
            throw new IllegalStateException("Book cannot be deleted: All copies must be returned before deletion.");
        }
        BookResponse response = mapToResponse(bookToDelete);
        bookToDelete.setActive(false);
        bookRepository.save(bookToDelete);
        return response;
    }

    // --- Helper Metotlar ---
    private List<BookResponse> convertToDtoList(List<Book> books) {
        return books.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private BookResponse mapToResponse(Book book) {
        BookResponse response = new BookResponse();
        response.setId(book.getId());
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

        Set<String> categoryNames = new HashSet<>();
        if (book.getCategories() != null) {
            categoryNames = book.getCategories().stream()
                    .map(Category::getName)
                    .collect(Collectors.toSet());
        }
        response.setCategories(categoryNames);

        Set<String> tagNames = new HashSet<>();
        if (book.getTags() != null) {
            tagNames.addAll(
                    book.getTags().stream()
                            .map(Tag::getName)
                            .collect(Collectors.toSet()));
        }
        response.setTags(tagNames);

        return response;
    }

    private BlindDateBookResponse mapToBlindDateResponse(Book book) {
        BlindDateBookResponse dto = new BlindDateBookResponse();
        dto.setDescription(book.getDescription());
        Set<String> tagNames = new HashSet<>();
        if (book.getTags() != null) {
            tagNames.addAll(
                    book.getTags().stream()
                            .map(Tag::getName)
                            .collect(Collectors.toSet()));
        }

        dto.setVibeTags(tagNames);
        dto.setRealBook(mapToResponse(book));
        return dto;
    }
}
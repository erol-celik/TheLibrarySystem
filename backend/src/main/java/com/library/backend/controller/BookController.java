package com.library.backend.controller;

import com.library.backend.dto.book.AddBookRequest;
import com.library.backend.dto.book.BlindDateBookResponse;
import com.library.backend.dto.book.BookFilterRequest;
import com.library.backend.dto.book.BookResponse;
import com.library.backend.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    // --- YENİ DİNAMİK ARAMA ENDPOINT'İ ---
    @GetMapping("/books/search")
    public ResponseEntity<Page<BookResponse>> searchBooks(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(bookService.searchBooksDynamic(title, author, category, minPrice, maxPrice, pageable));
    }

    @GetMapping("/books/new")
    public ResponseEntity<List<BookResponse>> getNewArrivals() {
        return ResponseEntity.ok(bookService.getNewArrivals());
    }

    @GetMapping("/books/top-rated")
    public ResponseEntity<List<BookResponse>> getTopRatedBooks() {
        return ResponseEntity.ok(bookService.getTopRatedBooks());
    }

    @GetMapping("/editors-pick")
    public ResponseEntity<List<BookResponse>> getEditorsChoice() {
        return ResponseEntity.ok(bookService.getEditorsChoice());
    }

    @GetMapping("/books")
    public ResponseEntity<List<BookResponse>> getAllBooks() {
        return ResponseEntity.ok(bookService.getAllBooks());
    }

    @GetMapping("/tags")
    public ResponseEntity<List<String>> getAllTags() {
        return ResponseEntity.ok(bookService.getAllTags());
    }

    // Eski filtreleme endpoint'i (Geriye dönük uyumluluk için korundu)
    @GetMapping("/books/filter")
    public ResponseEntity<Page<BookResponse>> getFilteredBooks(@ModelAttribute BookFilterRequest request) {
        return ResponseEntity.ok(bookService.getFilteredBooks(request));
    }

    @GetMapping("/books/blind-date-by-tag/{tagName}")
    public ResponseEntity<BlindDateBookResponse> getBlindDateBook(@PathVariable String tagName) {
        try {
            BlindDateBookResponse dto = bookService.getBlindDateBookByTag(tagName);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/librarian/add-book")
    @PreAuthorize("hasAuthority('ROLE_LIBRARIAN')")
    public ResponseEntity<BookResponse> addBook(@RequestBody AddBookRequest book) {
        BookResponse response = bookService.addBook(book);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/librarian/delete-book/{id}")
    @PreAuthorize("hasAuthority('ROLE_LIBRARIAN')")
    public ResponseEntity<?> removeBook(@PathVariable Long id) {
        try {
            BookResponse response = bookService.deleteBookById(id);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/librarian/update-book/{id}")
    @PreAuthorize("hasAuthority('ROLE_LIBRARIAN')")
    public ResponseEntity<?> updateBook(@PathVariable Long id, @RequestBody AddBookRequest bookRequest) {
        try {
            BookResponse response = bookService.updateBook(id, bookRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }

    @ExceptionHandler(org.springframework.validation.BindException.class)
    public ResponseEntity<Object> handleBindException(org.springframework.validation.BindException ex) {
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            System.out.println("❌ HATA ALANI: " + error.getField());
            System.out.println("❌ HATA MESAJI: " + error.getDefaultMessage());
            System.out.println("❌ REDDEDİLEN DEĞER: " + error.getRejectedValue());
        });

        return ResponseEntity.badRequest()
                .body("Filtreleme parametrelerinde hata var: " + ex.getAllErrors().get(0).getDefaultMessage());
    }
}
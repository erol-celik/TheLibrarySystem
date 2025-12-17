package com.library.backend.controller;

import com.library.backend.dto.book.AddBookRequest;
import com.library.backend.dto.book.BlindDateBookResponse;
import com.library.backend.dto.book.BookFilterRequest;
import com.library.backend.dto.book.BookResponse;
import com.library.backend.entity.Book;
import com.library.backend.entity.enums.BookType;
import com.library.backend.entity.enums.RentalStatus;
import com.library.backend.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    // 1. Yeni Gelen Kitapları Getir
    @GetMapping("/books/new")
    public ResponseEntity<List<BookResponse>> getNewArrivals() {
        return ResponseEntity.ok(bookService.getNewArrivals());
    }

    // 2. Editörün Seçimlerini Getir
    @GetMapping("/editors-pick")
    public ResponseEntity<List<BookResponse>> getEditorsChoice() {
        return ResponseEntity.ok(bookService.getEditorsChoice());
    }

    // 3. Tüm Kitapları Getir
    @GetMapping("/books")
    public ResponseEntity<List<BookResponse>> getAllBooks() {
        return ResponseEntity.ok(bookService.getAllBooks());
    }

    // Dinamik filtreleme ve sayfalama endpoint'i
    @GetMapping("/books/filter")
    public ResponseEntity<Page<Book>> getFilteredBooks(
            @ModelAttribute BookFilterRequest request) { // Sorgu parametreleri DTO'ya map edilir.

        Page<Book> booksPage = bookService.getFilteredBooks(request);
        return ResponseEntity.ok(booksPage);
    }


    @GetMapping("/books/blind-date-by-tag/{tagName}")
    public ResponseEntity<BlindDateBookResponse> getBlindDateBook(@PathVariable String tagName) {
        try {
            BlindDateBookResponse dto = bookService.getBlindDateBookByTag(tagName);
            return ResponseEntity.ok(dto); // 200 OK
        } catch (RuntimeException e) {
            // Katalog boşsa veya hata varsa 404 Not Found döndürür
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }


    @PostMapping("/admin/add-book")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<BookResponse> addBook(@RequestBody AddBookRequest book){

        BookResponse response = bookService.addBook(book);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/admin/delete-book/{isbn}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<BookResponse> removeBook(@PathVariable String isbn){

        BookResponse response = bookService.deleteBookByIsbn(isbn);

        return ResponseEntity.ok(response);
    }

    // BU METODU EKLE: Binding hatalarını yakalayıp konsola basar.
    @ExceptionHandler(org.springframework.validation.BindException.class)
    public ResponseEntity<Object> handleBindException(org.springframework.validation.BindException ex) {
        // Hatanın hangi alanda olduğunu konsola yazdır
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            System.out.println("❌ HATA ALANI: " + error.getField());
            System.out.println("❌ HATA MESAJI: " + error.getDefaultMessage());
            System.out.println("❌ REDDEDİLEN DEĞER: " + error.getRejectedValue());
        });

        return ResponseEntity.badRequest().body("Filtreleme parametrelerinde hata var: " + ex.getAllErrors().get(0).getDefaultMessage());
    }
}
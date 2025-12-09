package com.library.backend.controller;

import com.library.backend.dto.book.BlindDateBookResponse;
import com.library.backend.dto.book.BookResponse;
import com.library.backend.entity.Book;
import com.library.backend.entity.enums.BookType;
import com.library.backend.entity.enums.RentalStatus;
import com.library.backend.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    // 1. Yeni Gelen Kitapları Getir
    @GetMapping("/new")
    public ResponseEntity<List<BookResponse>> getNewArrivals() {
        return ResponseEntity.ok(bookService.getNewArrivals());
    }

    // 2. Editörün Seçimlerini Getir
    /*@GetMapping("/editors-pick")
    public ResponseEntity<List<BookResponse>> getEditorsChoice() {
        return ResponseEntity.ok(bookService.getEditorsChoice());
    }*/

    // 3. Tüm Kitapları Getir
    @GetMapping
    public ResponseEntity<List<BookResponse>> getAllBooks() {
        return ResponseEntity.ok(bookService.getAllBooks());
    }

    @GetMapping("/blind-date-by-tag/{tagName}")
    public ResponseEntity<BlindDateBookResponse> getBlindDateBook(@PathVariable String tagName) {
        try {
            BlindDateBookResponse dto = bookService.getBlindDateBookByTag(tagName);
            return ResponseEntity.ok(dto); // 200 OK
        } catch (RuntimeException e) {
            // Katalog boşsa veya hata varsa 404 Not Found döndürür
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<BookResponse>> searchBooks(@RequestParam("q") String keyword) {

        List<BookResponse> results = bookService.searchBooks(keyword);

        if (results.isEmpty()) {
            // Sonuç yoksa 204 No Content döndürülür
            return ResponseEntity.noContent().build();
        }

        // Sonuç varsa 200 OK ile Entity listesini döndür
        return ResponseEntity.ok(results);
    }

    @GetMapping("/search-by-author")
    public ResponseEntity<List<BookResponse>> searchBooksByAuthor(@RequestParam("q") String keyword) {

        List<BookResponse> results = bookService.searchBooksByAuthor(keyword);

        if (results.isEmpty()) {
            // Sonuç yoksa 204 No Content döndürülür
            return ResponseEntity.noContent().build();
        }

        // Sonuç varsa 200 OK ile Entity listesini döndür
        return ResponseEntity.ok(results);
    }

    @GetMapping("/search-by-status")
    public ResponseEntity<List<BookResponse>> searchBooksByStatus(@RequestParam("q") RentalStatus keyword) {

        List<BookResponse> results = bookService.searchBooksByStatus(keyword);

        if (results.isEmpty()) {
            // Sonuç yoksa 204 No Content döndürülür
            return ResponseEntity.noContent().build();
        }

        // Sonuç varsa 200 OK ile Entity listesini döndür
        return ResponseEntity.ok(results);
    }

    @GetMapping("/search-by-type")
    public ResponseEntity<List<BookResponse>> searchBooksByStatus(@RequestParam("q") BookType keyword) {

        List<BookResponse> results = bookService.searchBooksByBookType(keyword);

        if (results.isEmpty()) {
            // Sonuç yoksa 204 No Content döndürülür
            return ResponseEntity.noContent().build();
        }

        // Sonuç varsa 200 OK ile Entity listesini döndür
        return ResponseEntity.ok(results);
    }
}
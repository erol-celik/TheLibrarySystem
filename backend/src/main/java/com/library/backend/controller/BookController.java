package com.library.backend.controller;

import com.library.backend.dto.response.BookResponse;
import com.library.backend.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
package com.library.backend.service;

import com.library.backend.dto.response.BookResponse;
import com.library.backend.entity.Book;
import com.library.backend.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookService {

    private final BookRepository bookRepository;

    // --- CONSTRUCTOR INJECTION (Manuel ve Garantili) ---
    @Autowired // Spring'e "Bunu kullan" diyoruz
    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
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
        return convertToDtoList(bookRepository.findAll());
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
        response.setId(book.getId());
        response.setTitle(book.getTitle());
        response.setAuthor(book.getAuthor());
        response.setImageUrl(book.getImageUrl());
        response.setEditorsPick(book.isEditorsPick());

        // Kategori String Birleştirme (Daha önce yazdığımız kod)
        String categoryName = "Genel";

        if (book.getCategory() != null) {
            categoryName = book.getCategory().getName();
        }

        response.setCategoryName(categoryName);

        return response;
    }
}
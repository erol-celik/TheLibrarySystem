package com.library.backend.controller;

import com.library.backend.entity.Category;
import com.library.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<String>> getAllCategoryNames() {
        // Frontend sadece isimleri istiyor (List<String>)
        List<String> categoryNames = categoryRepository.findAll()
                .stream()
                .map(Category::getName)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(categoryNames);
    }
}
package com.library.backend.specification;

import com.library.backend.entity.Book;
import com.library.backend.entity.Category;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class BookSpecification {

    // 1. Kitap Başlığına Göre Ara (İçerir - Case Insensitive)
    public static Specification<Book> hasTitle(String title) {
        return (root, query, criteriaBuilder) -> {
            if (title == null || title.isEmpty()) return null;
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), "%" + title.toLowerCase() + "%");
        };
    }

    // 2. Yazara Göre Ara (İçerir - Case Insensitive)
    public static Specification<Book> hasAuthor(String author) {
        return (root, query, criteriaBuilder) -> {
            if (author == null || author.isEmpty()) return null;
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("author")), "%" + author.toLowerCase() + "%");
        };
    }

    // 3. Fiyat Aralığı
    public static Specification<Book> priceBetween(BigDecimal min, BigDecimal max) {
        return (root, query, criteriaBuilder) -> {
            if (min == null && max == null) return null;
            if (min != null && max != null) return criteriaBuilder.between(root.get("price"), min, max);
            if (min != null) return criteriaBuilder.greaterThanOrEqualTo(root.get("price"), min);
            return criteriaBuilder.lessThanOrEqualTo(root.get("price"), max);
        };
    }

    // 4. Kategoriye Göre Ara (JOIN işlemi)
    public static Specification<Book> hasCategory(String categoryName) {
        return (root, query, criteriaBuilder) -> {
            if (categoryName == null || categoryName.isEmpty()) return null;
            
            // Book entity içindeki "categories" listesine join atıyoruz
            Join<Book, Category> categoryJoin = root.join("categories");
            
            // Kategori isminde (name) arama yapıyoruz
            return criteriaBuilder.equal(categoryJoin.get("name"), categoryName);
        };
    }
}
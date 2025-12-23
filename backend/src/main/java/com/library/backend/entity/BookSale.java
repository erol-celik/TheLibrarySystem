package com.library.backend.entity;

import com.library.backend.entity.enums.BookSaleType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;

@Entity
@Table(name = "book_sales") // veritabanında tablo oluşturur
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)

public class BookSale extends BaseEntity {

    // fk-user satın alan
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // fk-kitap satın alınan
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    // satış tipi
    @Enumerated(EnumType.STRING)
    @Column(name = "book_sale_type", nullable = false)
    private BookSaleType bookSaleType;

    // satış fiyatını saklar
    @Column(name = "sold_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal soldPrice;

}

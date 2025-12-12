package com.library.backend.dto.rental;

import com.library.backend.entity.enums.RentalStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class RentalResponse {
    private Long id;
    private LocalDate rentDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private RentalStatus status;
    private BigDecimal penaltyFee;

    // Kitap Detayları (İç içe nesne yerine düzleştirilmiş veri)
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private String bookImage;

    // Kullanıcı Detayı
    private Long userId;
    private String userName;
}
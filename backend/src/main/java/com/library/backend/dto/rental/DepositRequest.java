package com.library.backend.dto.rental;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DepositRequest {
    private BigDecimal amount; //yükleme yapılacak miktar
}
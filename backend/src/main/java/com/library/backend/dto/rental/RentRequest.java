package com.library.backend.dto.rental;

import lombok.Data;

@Data
public class RentRequest {
    private Long bookId; // istenilen kitabın id
}
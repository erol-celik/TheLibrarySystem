package com.library.backend.dto.contribution;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DonationResponse {
    private Long id;
    private String bookTitle;
    private String bookAuthor;
    private String description;
    private String status;
    private LocalDateTime requestDate;
    private String username;
}

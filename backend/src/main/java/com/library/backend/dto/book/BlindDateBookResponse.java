package com.library.backend.dto.book;

import com.library.backend.entity.Tag;
import lombok.Data;
import java.util.List;
import java.util.Set;


@Data
public class BlindDateBookResponse {
    private String maskedTitle = "???"; // Maskelenmiş Başlık
    private String maskedAuthor = "Unknown"; // Maskelenmiş Yazar
    private String description; // Açıklama, ipucu olarak kullanılır
    private Set<String> vibeTags; // Kitabın ruh halini yansıtan etiketler
    // Getter/Setter ve Constructor'lar buraya gelecek (@Data kullanabilirsiniz)
}

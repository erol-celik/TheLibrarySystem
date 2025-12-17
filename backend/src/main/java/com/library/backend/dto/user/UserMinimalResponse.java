// backend/src/main/java/com/library/backend/dto/user/UserMinimalResponse.java (YENİ DOSYA)
package com.library.backend.dto.user;

import lombok.Data;

@Data
public class UserMinimalResponse {
    private Long id;
    private String name;
    private String profipePicture;

}
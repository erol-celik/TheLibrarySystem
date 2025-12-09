package com.library.backend.service;


import com.library.backend.dto.auth.LoginRequest;
import com.library.backend.dto.auth.RegisterRequest;
import com.library.backend.dto.user.UserDTO;
import com.library.backend.entity.Role;
import com.library.backend.entity.User;
import com.library.backend.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class AuthService {

    UserRepository userRepository;

    public UserDTO register(RegisterRequest registerRequest){

        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Kayıt başarısız: Bu e-posta adresi zaten kullanılıyor.");
        }

        User user = mapToEntity(registerRequest);
        User savedUser = userRepository.save(user);

        return mapToDTO(savedUser);
    }

    public UserDTO login(LoginRequest loginRequest){

        Optional<User> userEntity = userRepository.findByEmail(loginRequest.getEmail());

        if(!userEntity.isPresent()){
            throw new RuntimeException("Kullanıcı adı veya parola hatalı.");
        }
        User user = userEntity.get();

        if (!user.getPassword().equals(loginRequest.getPassword())) {
            throw new RuntimeException("Kullanıcı adı veya parola hatalı.");
        }

        return mapToDTO(user);
    }

    private UserDTO mapToDTO(User entity){

        UserDTO dto = new UserDTO();

        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setEmail(entity.getEmail());

        return dto;
    }

    private User mapToEntity(RegisterRequest dto){
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        return user;
    }

}

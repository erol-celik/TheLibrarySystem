package com.library.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

import com.library.backend.repository.UserRepository;

@SpringBootApplication
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner debugDatabaseUsers(UserRepository userRepository) {
		return args -> {
			System.out.println("\n\n#############################################");
			System.out.println("### VERİTABANI KULLANICI KONTROLÜ BAŞLADI ###");

			userRepository.findAll().forEach(user -> {
				System.out.println("---------------------------------------------");
				System.out.println("EMAIL    : " + user.getEmail());
				System.out.println("PASSWORD : " + user.getPassword()); // Burası 123 mü yoksa $2a$... mı?
				System.out.println("ROLE     : " + user.getRoles());
			});

			System.out.println("#############################################\n\n");
		};
	}

}

package com.library.backend;

import org.springframework.web.bind.annotation.CrossOrigin; // Bu importu unutma!
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/test")
@CrossOrigin(origins = "http://localhost:5173") // React'in çalıştığı port
public class TestController {

    @GetMapping("/hello")
    public String sayHello() {
        return "Hello World! The Library System Backend is running.";
    }

    @GetMapping("/admin-only")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public String adminOnly() {
        return "Burayı görüyorsan PATRON sensin!";
    }

    @GetMapping("/user-only")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('USER')")
    public String userOnly() {
        return "Hoşgeldin standart kullanıcı.";
    }
}
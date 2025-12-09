package com.library.backend.repository;

import com.library.backend.entity.User;
import com.library.backend.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    //wallet işlemleri


    Optional<Wallet> findByUser(User user);
}
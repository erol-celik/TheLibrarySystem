package com.library.backend.repository;

import com.library.backend.entity.Feedback;
import com.library.backend.entity.enums.FeedbackStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    // Admin Paneli için: Sadece 'NEW' olanları getir
    List<Feedback> findByFeedbackStatus(FeedbackStatus status);
}
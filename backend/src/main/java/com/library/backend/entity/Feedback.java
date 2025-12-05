package com.library.backend.entity;

import com.library.backend.entity.enums.FeedbackStatus;
import com.library.backend.entity.enums.FeedbackType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name="feedbacks")
@Data
@EqualsAndHashCode(callSuper = true)

public class Feedback extends BaseEntity{


    //fk - öneren user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = true)//nullable - anonimlik
    private User user;

    //feedback çeşidi öneri-şikayet
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeedbackType feedbackType;

    //mesaj
    @Column(name = "message", nullable = false)
    private String message;

    //status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeedbackStatus feedbackStatus=FeedbackStatus.NEW;//default


}

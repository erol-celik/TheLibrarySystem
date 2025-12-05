package com.library.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "notifications")
@Data
@EqualsAndHashCode(callSuper = true)
public class Notification extends BaseEntity {


    // fk - ntfctn alan
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_user_id", nullable = false)
    private User recipientUser;

    //fk - ntfctn gönderen
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_user_id", nullable = false)
    private User senderUser;

    //bildirim
    @Column(nullable = false)
    private String message;

    //notification isread
    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

}
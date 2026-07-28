package com.jobportal.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "support_tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String userName;

    private String userEmail;

    private String userRole;

    private String subject;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Builder.Default
    private String status = "OPEN"; // OPEN, IN_PROGRESS, RESOLVED

    @Column(columnDefinition = "TEXT")
    private String adminReply;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}

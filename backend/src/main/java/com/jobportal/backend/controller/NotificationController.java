package com.jobportal.backend.controller;

import com.jobportal.backend.model.Notification;
import com.jobportal.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@RequestParam(required = false) String role) {
        if (role != null && !role.isEmpty()) {
            return ResponseEntity.ok(notificationRepository.findByRole(role.toLowerCase()));
        }
        return ResponseEntity.ok(notificationRepository.findAll());
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Optional<Notification> notifOpt = notificationRepository.findById(id);
        if (notifOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Notification not found");
        }

        Notification notification = notifOpt.get();
        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        return ResponseEntity.ok(saved);
    }
}

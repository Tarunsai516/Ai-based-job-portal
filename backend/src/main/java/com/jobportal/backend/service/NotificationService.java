package com.jobportal.backend.service;

import com.jobportal.backend.common.exception.ResourceNotFoundException;
import com.jobportal.backend.model.Notification;
import com.jobportal.backend.repository.NotificationRepository;
import com.jobportal.backend.security.CustomUserDetails;
import com.jobportal.backend.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<Notification> getNotifications(String role) {
        CustomUserDetails currentUser = SecurityUtils.getCurrentUserDetails();
        if (currentUser != null) {
            return notificationRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        }
        if (role != null && !role.isEmpty()) {
            return notificationRepository.findByRole(role.toLowerCase());
        }
        return notificationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Notification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Notification markAsRead(Long id) {
        logger.info("Marking notification ID {} as read", id);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));
        CustomUserDetails currentUser = SecurityUtils.getCurrentUserDetails();
        if (currentUser != null && notification.getUserId() != null
                && !notification.getUserId().equals(currentUser.getId())) {
            throw new com.jobportal.backend.common.exception.ForbiddenException(
                    "You do not have permission to update this notification");
        }
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    /**
     * Create a notification for a specific user.
     */
    @Transactional
    public Notification createNotification(Long userId, String role, String title, String message, String type) {
        Notification notification = Notification.builder()
                .userId(userId)
                .role(role)
                .title(title)
                .message(message)
                .type(type)
                .time(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                .build();
        logger.info("Creating notification for user {}: {}", userId, title);
        return notificationRepository.save(notification);
    }
}

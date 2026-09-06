package com.jobportal.backend.service;

import com.jobportal.backend.common.exception.ResourceNotFoundException;
import com.jobportal.backend.model.Notification;
import com.jobportal.backend.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<Notification> getNotifications(String role) {
        if (role != null && !role.isEmpty()) {
            return notificationRepository.findByRole(role.toLowerCase());
        }
        return notificationRepository.findAll();
    }

    @Transactional
    public Notification markAsRead(Long id) {
        logger.info("Marking notification ID {} as read", id);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));

        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}

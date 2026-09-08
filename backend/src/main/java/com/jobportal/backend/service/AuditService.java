package com.jobportal.backend.service;

import com.jobportal.backend.model.AuditLog;
import com.jobportal.backend.model.enums.AuditAction;
import com.jobportal.backend.repository.AuditLogRepository;
import com.jobportal.backend.security.CustomUserDetails;
import com.jobportal.backend.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for recording and querying audit logs.
 * Audit logging is asynchronous to avoid impacting request latency.
 */
@Service
public class AuditService {

    private static final Logger logger = LoggerFactory.getLogger(AuditService.class);

    @Autowired
    private AuditLogRepository auditLogRepository;

    /**
     * Log an audit event asynchronously.
     */
    @Async
    @Transactional
    public void log(AuditAction action, String entityType, String entityId, String details) {
        try {
            CustomUserDetails user = SecurityUtils.getCurrentUserDetails();
            AuditLog log = AuditLog.builder()
                    .userId(user != null ? user.getId() : null)
                    .userEmail(user != null ? user.getEmail() : null)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .build();
            auditLogRepository.save(log);
        } catch (Exception e) {
            // Audit logging should never break business logic
            logger.warn("Failed to save audit log: {}", e.getMessage());
        }
    }

    /**
     * Log with explicit user info (for login events before security context is set).
     */
    @Async
    @Transactional
    public void log(AuditAction action, Long userId, String userEmail,
                    String entityType, String entityId, String details) {
        try {
            AuditLog log = AuditLog.builder()
                    .userId(userId)
                    .userEmail(userEmail)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .build();
            auditLogRepository.save(log);
        } catch (Exception e) {
            logger.warn("Failed to save audit log: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogsByUser(Long userId, Pageable pageable) {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogsByAction(AuditAction action, Pageable pageable) {
        return auditLogRepository.findByAction(action, pageable);
    }
}

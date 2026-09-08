package com.jobportal.backend.controller;

import com.jobportal.backend.model.AuditLog;
import com.jobportal.backend.model.enums.AuditAction;
import com.jobportal.backend.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    @Autowired
    private AuditService auditService;

    @GetMapping
    public ResponseEntity<Page<AuditLog>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(auditService.getAuditLogs(pageable));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<AuditLog>> getLogsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(auditService.getAuditLogsByUser(userId, pageable));
    }

    @GetMapping("/action/{action}")
    public ResponseEntity<Page<AuditLog>> getLogsByAction(
            @PathVariable String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        AuditAction auditAction = AuditAction.valueOf(action.toUpperCase());
        return ResponseEntity.ok(auditService.getAuditLogsByAction(auditAction, pageable));
    }
}

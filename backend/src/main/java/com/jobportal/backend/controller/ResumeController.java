package com.jobportal.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobportal.backend.common.exception.ForbiddenException;
import com.jobportal.backend.model.Resume;
import com.jobportal.backend.security.CustomUserDetails;
import com.jobportal.backend.security.SecurityUtils;
import com.jobportal.backend.service.ResumeService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;
    private final ObjectMapper objectMapper;

    public ResumeController(ResumeService resumeService, ObjectMapper objectMapper) {
        this.resumeService = resumeService;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/{resumeId}")
    public ResponseEntity<Map<String, Object>> getResume(@PathVariable Long resumeId) {
        Resume resume = resumeService.getResumeForUser(resumeId, currentUserId());
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("resumeId", resume.getId());
        response.put("filename", resume.getOriginalFileName());
        response.put("status", resume.getStatus().name());
        response.put("errorMessage", resume.getErrorMessage());
        response.put("processedAt", resume.getProcessedAt());

        if (resume.getParsedDataJson() != null && !resume.getParsedDataJson().isBlank()) {
            try {
                JsonNode parsedData = objectMapper.readTree(resume.getParsedDataJson());
                response.put("parsedData", parsedData);
            } catch (Exception ignored) {
                response.put("parsedData", null);
            }
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/latest")
    public ResponseEntity<Map<String, Object>> getLatestResume() {
        Resume resume = resumeService.getLatestResumeForUser(currentUserId());
        if (resume == null) {
            return ResponseEntity.noContent().build();
        }
        return getResume(resume.getId());
    }

    @GetMapping
    public ResponseEntity<java.util.List<Map<String, Object>>> listResumes() {
        return ResponseEntity.ok(resumeService.getResumeSummariesForUser(currentUserId()));
    }

    @GetMapping("/{resumeId}/ai-review/job/{jobId}")
    public ResponseEntity<com.jobportal.backend.service.ai.ResumeCoachResult> reviewResumeForJob(
            @PathVariable Long resumeId, @PathVariable Long jobId) {
        return ResponseEntity.ok(resumeService.reviewResumeForJob(resumeId, jobId, currentUserId()));
    }

    @GetMapping("/latest/ai-review")
    public ResponseEntity<com.jobportal.backend.service.ai.ResumeCoachResult> reviewLatestResume() {
        return ResponseEntity.ok(resumeService.reviewLatestResume(currentUserId()));
    }

    @GetMapping("/{resumeId}/file")
    public ResponseEntity<Resource> downloadResume(@PathVariable Long resumeId) {
        Resume resume = resumeService.getResumeForUser(resumeId, currentUserId());
        Resource resource = resumeService.getFileForUser(resumeId, currentUserId());
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        try {
            if (resume.getContentType() != null) {
                mediaType = MediaType.parseMediaType(resume.getContentType());
            }
        } catch (IllegalArgumentException ignored) {
            // Keep the generic binary content type for unknown MIME types.
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + resume.getOriginalFileName() + "\"")
                .body(resource);
    }

    private Long currentUserId() {
        CustomUserDetails currentUser = SecurityUtils.getCurrentUserDetails();
        if (currentUser == null) {
            throw new ForbiddenException("Authentication is required to access a resume");
        }
        return currentUser.getId();
    }
}
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.LinkedHashMap;
import java.util.List;
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

    @GetMapping("/{resumeId}/interview-questions/job/{jobId}")
    public ResponseEntity<List<String>> getInterviewQuestions(
            @PathVariable Long resumeId, @PathVariable Long jobId) {
        return ResponseEntity.ok(resumeService.generateInterviewQuestions(resumeId, jobId, currentUserId()));
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

    @GetMapping("/{resumeId}/tailor-preview/job/{jobId}")
    public ResponseEntity<com.jobportal.backend.service.ai.TailoredResumeResult> previewTailorResume(
            @PathVariable Long resumeId, @PathVariable Long jobId) {
        return ResponseEntity.ok(resumeService.previewTailorResume(resumeId, jobId, currentUserId()));
    }

    @PostMapping("/{resumeId}/tailor-custom/job/{jobId}")
    public ResponseEntity<Map<String, Object>> generateCustomTailoredResume(
            @PathVariable Long resumeId,
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "docx") String format,
            @RequestBody com.jobportal.backend.service.ai.TailoredResumeResult customizedData) {
        Resume tailoredResume = resumeService.generateCustomTailoredResume(resumeId, jobId, customizedData, format, currentUserId());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("resumeId", tailoredResume.getId());
        response.put("filename", tailoredResume.getOriginalFileName());
        response.put("status", tailoredResume.getStatus().name());
        response.put("contentType", tailoredResume.getContentType());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{resumeId}/tailor/{jobId}")
    public ResponseEntity<Map<String, Object>> tailorResume(@PathVariable Long resumeId, @PathVariable Long jobId) {
        Resume tailoredResume = resumeService.tailorResume(resumeId, jobId, currentUserId());
        
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("resumeId", tailoredResume.getId());
        response.put("filename", tailoredResume.getOriginalFileName());
        response.put("status", tailoredResume.getStatus().name());
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{resumeId}")
    public ResponseEntity<Map<String, Object>> deleteResume(@PathVariable Long resumeId) {
        resumeService.deleteResume(resumeId, currentUserId());
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Resume deleted successfully");
        response.put("resumeId", resumeId);
        return ResponseEntity.ok(response);
    }

    private Long currentUserId() {
        CustomUserDetails currentUser = SecurityUtils.getCurrentUserDetails();
        if (currentUser == null) {
            throw new ForbiddenException("Authentication is required to access a resume");
        }
        return currentUser.getId();
    }
}
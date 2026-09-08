package com.jobportal.backend.model;

import com.jobportal.backend.model.enums.ResumeStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resumes", indexes = {
    @Index(name = "idx_resume_candidate_id", columnList = "candidateId"),
    @Index(name = "idx_resume_status", columnList = "status")
})
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long candidateId;

    private Long userId;

    /** Original filename from the upload. */
    private String originalFileName;

    /** Server-side stored filename (UUID-based for security). */
    private String storedFileName;

    /** Path to the stored file. */
    private String storedPath;

    /** MIME type. */
    private String contentType;

    /** File size in bytes. */
    private Long fileSize;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResumeStatus status = ResumeStatus.UPLOADED;

    /** Extracted raw text from PDF/DOCX. */
    @Column(columnDefinition = "TEXT")
    private String rawText;

    /** AI-parsed structured data as JSON. */
    @Column(columnDefinition = "TEXT")
    private String parsedDataJson;

    /** Error message if processing failed. */
    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime processedAt;

    public Resume() {}

    public Resume(Long id, Long candidateId, Long userId, String originalFileName, String storedFileName,
                  String storedPath, String contentType, Long fileSize, ResumeStatus status,
                  String rawText, String parsedDataJson, String errorMessage,
                  LocalDateTime createdAt, LocalDateTime processedAt) {
        this.id = id;
        this.candidateId = candidateId;
        this.userId = userId;
        this.originalFileName = originalFileName;
        this.storedFileName = storedFileName;
        this.storedPath = storedPath;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.status = status != null ? status : ResumeStatus.UPLOADED;
        this.rawText = rawText;
        this.parsedDataJson = parsedDataJson;
        this.errorMessage = errorMessage;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.processedAt = processedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }

    public String getStoredFileName() { return storedFileName; }
    public void setStoredFileName(String storedFileName) { this.storedFileName = storedFileName; }

    public String getStoredPath() { return storedPath; }
    public void setStoredPath(String storedPath) { this.storedPath = storedPath; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public ResumeStatus getStatus() { return status; }
    public void setStatus(ResumeStatus status) { this.status = status; }

    public String getRawText() { return rawText; }
    public void setRawText(String rawText) { this.rawText = rawText; }

    public String getParsedDataJson() { return parsedDataJson; }
    public void setParsedDataJson(String parsedDataJson) { this.parsedDataJson = parsedDataJson; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }

    // Builder
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long candidateId;
        private Long userId;
        private String originalFileName;
        private String storedFileName;
        private String storedPath;
        private String contentType;
        private Long fileSize;
        private ResumeStatus status = ResumeStatus.UPLOADED;
        private String rawText;
        private String parsedDataJson;
        private String errorMessage;
        private LocalDateTime createdAt = LocalDateTime.now();
        private LocalDateTime processedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder candidateId(Long candidateId) { this.candidateId = candidateId; return this; }
        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder originalFileName(String originalFileName) { this.originalFileName = originalFileName; return this; }
        public Builder storedFileName(String storedFileName) { this.storedFileName = storedFileName; return this; }
        public Builder storedPath(String storedPath) { this.storedPath = storedPath; return this; }
        public Builder contentType(String contentType) { this.contentType = contentType; return this; }
        public Builder fileSize(Long fileSize) { this.fileSize = fileSize; return this; }
        public Builder status(ResumeStatus status) { this.status = status; return this; }
        public Builder rawText(String rawText) { this.rawText = rawText; return this; }
        public Builder parsedDataJson(String parsedDataJson) { this.parsedDataJson = parsedDataJson; return this; }
        public Builder errorMessage(String errorMessage) { this.errorMessage = errorMessage; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder processedAt(LocalDateTime processedAt) { this.processedAt = processedAt; return this; }

        public Resume build() {
            return new Resume(id, candidateId, userId, originalFileName, storedFileName, storedPath,
                    contentType, fileSize, status, rawText, parsedDataJson, errorMessage, createdAt, processedAt);
        }
    }
}

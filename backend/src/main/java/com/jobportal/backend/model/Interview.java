package com.jobportal.backend.model;

import com.jobportal.backend.model.enums.InterviewStatus;
import com.jobportal.backend.model.enums.InterviewType;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interviews", indexes = {
    @Index(name = "idx_interview_application_id", columnList = "applicationId"),
    @Index(name = "idx_interview_status", columnList = "status"),
    @Index(name = "idx_interview_scheduled_at", columnList = "scheduledAt")
})
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long applicationId;

    private Long candidateId;
    private Long recruiterId;
    private Long jobId;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    /** Duration in minutes. */
    private int durationMinutes = 60;

    @Enumerated(EnumType.STRING)
    private InterviewType type = InterviewType.TECHNICAL;

    @Enumerated(EnumType.STRING)
    private InterviewStatus status = InterviewStatus.SCHEDULED;

    private String meetingLink;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    public Interview() {}

    public Interview(Long id, Long applicationId, Long candidateId, Long recruiterId, Long jobId,
                     LocalDateTime scheduledAt, int durationMinutes, InterviewType type,
                     InterviewStatus status, String meetingLink, String notes, String feedback,
                     LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.applicationId = applicationId;
        this.candidateId = candidateId;
        this.recruiterId = recruiterId;
        this.jobId = jobId;
        this.scheduledAt = scheduledAt;
        this.durationMinutes = durationMinutes;
        this.type = type != null ? type : InterviewType.TECHNICAL;
        this.status = status != null ? status : InterviewStatus.SCHEDULED;
        this.meetingLink = meetingLink;
        this.notes = notes;
        this.feedback = feedback;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public Long getRecruiterId() { return recruiterId; }
    public void setRecruiterId(Long recruiterId) { this.recruiterId = recruiterId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public InterviewType getType() { return type; }
    public void setType(InterviewType type) { this.type = type; }

    public InterviewStatus getStatus() { return status; }
    public void setStatus(InterviewStatus status) { this.status = status; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long applicationId;
        private Long candidateId;
        private Long recruiterId;
        private Long jobId;
        private LocalDateTime scheduledAt;
        private int durationMinutes = 60;
        private InterviewType type = InterviewType.TECHNICAL;
        private InterviewStatus status = InterviewStatus.SCHEDULED;
        private String meetingLink;
        private String notes;
        private String feedback;
        private LocalDateTime createdAt = LocalDateTime.now();
        private LocalDateTime updatedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder applicationId(Long applicationId) { this.applicationId = applicationId; return this; }
        public Builder candidateId(Long candidateId) { this.candidateId = candidateId; return this; }
        public Builder recruiterId(Long recruiterId) { this.recruiterId = recruiterId; return this; }
        public Builder jobId(Long jobId) { this.jobId = jobId; return this; }
        public Builder scheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; return this; }
        public Builder durationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; return this; }
        public Builder type(InterviewType type) { this.type = type; return this; }
        public Builder status(InterviewStatus status) { this.status = status; return this; }
        public Builder meetingLink(String meetingLink) { this.meetingLink = meetingLink; return this; }
        public Builder notes(String notes) { this.notes = notes; return this; }
        public Builder feedback(String feedback) { this.feedback = feedback; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Interview build() {
            return new Interview(id, applicationId, candidateId, recruiterId, jobId, scheduledAt,
                    durationMinutes, type, status, meetingLink, notes, feedback, createdAt, updatedAt);
        }
    }
}

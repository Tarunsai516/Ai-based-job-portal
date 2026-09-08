package com.jobportal.backend.model;

import com.jobportal.backend.common.exception.BadRequestException;
import com.jobportal.backend.model.enums.ApplicationStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications", indexes = {
        @Index(name = "idx_app_candidate_id", columnList = "candidateId"),
        @Index(name = "idx_app_recruiter_id", columnList = "recruiterId"),
        @Index(name = "idx_app_job_id", columnList = "jobId"),
        @Index(name = "idx_app_status", columnList = "status")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_candidate_job_application", columnNames = { "candidateId", "jobId" })
})
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String jobId;
    private String jobTitle;
    private String companyName;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    private String appliedDate;
    private int matchScore;
    private String candidateId;
    private String candidateName;
    private String recruiterId;
    private String recruiterEmail;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    public Application() {
    }

    public Application(Long id, String jobId, String jobTitle, String companyName, ApplicationStatus status,
            String appliedDate, int matchScore, String candidateId, String candidateName,
            String recruiterId, String recruiterEmail, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.companyName = companyName;
        this.status = status != null ? status : ApplicationStatus.APPLIED;
        this.appliedDate = appliedDate;
        this.matchScore = matchScore;
        this.candidateId = candidateId;
        this.candidateName = candidateName;
        this.recruiterId = recruiterId;
        this.recruiterEmail = recruiterEmail;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.updatedAt = updatedAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public String getAppliedDate() {
        return appliedDate;
    }

    public void setAppliedDate(String appliedDate) {
        this.appliedDate = appliedDate;
    }

    public int getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(int matchScore) {
        this.matchScore = matchScore;
    }

    public String getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(String candidateId) {
        this.candidateId = candidateId;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public String getRecruiterId() {
        return recruiterId;
    }

    public void setRecruiterId(String recruiterId) {
        this.recruiterId = recruiterId;
    }

    public String getRecruiterEmail() {
        return recruiterEmail;
    }

    public void setRecruiterEmail(String recruiterEmail) {
        this.recruiterEmail = recruiterEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getStatusString() {
        if (status == null)
            return "Applied";
        return switch (status) {
            case APPLIED -> "Applied";
            case UNDER_REVIEW -> "Reviewing";
            case SHORTLISTED -> "Shortlisted";
            case INTERVIEW_SCHEDULED -> "Interviewing";
            case INTERVIEW_COMPLETED -> "Interview Completed";
            case SELECTED -> "Selected";
            case REJECTED -> "Rejected";
            case WITHDRAWN -> "Withdrawn";
        };
    }

    public static ApplicationStatus parseStatus(String statusStr) {
        if (statusStr == null || statusStr.isEmpty())
            return ApplicationStatus.APPLIED;
        return switch (statusStr.toLowerCase().trim()) {
            case "applied" -> ApplicationStatus.APPLIED;
            case "reviewing", "under_review", "under review" -> ApplicationStatus.UNDER_REVIEW;
            case "shortlisted" -> ApplicationStatus.SHORTLISTED;
            case "interviewing", "interview_scheduled", "interview scheduled" -> ApplicationStatus.INTERVIEW_SCHEDULED;
            case "interview completed", "interview_completed" -> ApplicationStatus.INTERVIEW_COMPLETED;
            case "selected", "accepted" -> ApplicationStatus.SELECTED;
            case "rejected" -> ApplicationStatus.REJECTED;
            case "withdrawn" -> ApplicationStatus.WITHDRAWN;
            default -> throw new BadRequestException("Invalid application status: " + statusStr);
        };
    }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String jobId;
        private String jobTitle;
        private String companyName;
        private ApplicationStatus status = ApplicationStatus.APPLIED;
        private String appliedDate;
        private int matchScore;
        private String candidateId;
        private String candidateName;
        private String recruiterId;
        private String recruiterEmail;
        private LocalDateTime createdAt = LocalDateTime.now();
        private LocalDateTime updatedAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder jobId(String jobId) {
            this.jobId = jobId;
            return this;
        }

        public Builder jobTitle(String jobTitle) {
            this.jobTitle = jobTitle;
            return this;
        }

        public Builder companyName(String companyName) {
            this.companyName = companyName;
            return this;
        }

        public Builder status(ApplicationStatus status) {
            this.status = status;
            return this;
        }

        public Builder appliedDate(String appliedDate) {
            this.appliedDate = appliedDate;
            return this;
        }

        public Builder matchScore(int matchScore) {
            this.matchScore = matchScore;
            return this;
        }

        public Builder candidateId(String candidateId) {
            this.candidateId = candidateId;
            return this;
        }

        public Builder candidateName(String candidateName) {
            this.candidateName = candidateName;
            return this;
        }

        public Builder recruiterId(String recruiterId) {
            this.recruiterId = recruiterId;
            return this;
        }

        public Builder recruiterEmail(String recruiterEmail) {
            this.recruiterEmail = recruiterEmail;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Application build() {
            return new Application(id, jobId, jobTitle, companyName, status, appliedDate, matchScore,
                    candidateId, candidateName, recruiterId, recruiterEmail, createdAt, updatedAt);
        }
    }
}

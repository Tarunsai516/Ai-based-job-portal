package com.jobportal.backend.dto;

import com.jobportal.backend.model.Application;

public class ApplicationResponse {

    private Long id;
    private String jobId;
    private String jobTitle;
    private String companyName;
    private String status;
    private String appliedDate;
    private int matchScore;
    private Long resumeId;
    private String candidateId;
    private String candidateName;
    private String recruiterId;
    private String recruiterEmail;

    public ApplicationResponse() {
    }

    public ApplicationResponse(Long id, String jobId, String jobTitle, String companyName,
            String status, String appliedDate, int matchScore, String candidateId,
            String candidateName, String recruiterId, String recruiterEmail) {
        this.id = id;
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.companyName = companyName;
        this.status = status;
        this.appliedDate = appliedDate;
        this.matchScore = matchScore;
        this.candidateId = candidateId;
        this.candidateName = candidateName;
        this.recruiterId = recruiterId;
        this.recruiterEmail = recruiterEmail;
    }

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
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

    public Long getResumeId() {
        return resumeId;
    }

    public void setResumeId(Long resumeId) {
        this.resumeId = resumeId;
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

    public static ApplicationResponse fromEntity(Application app) {
        if (app == null)
            return null;
        return ApplicationResponse.builder()
                .id(app.getId())
                .jobId(app.getJobId())
                .jobTitle(app.getJobTitle())
                .companyName(app.getCompanyName())
                .status(app.getStatusString())
                .appliedDate(app.getAppliedDate())
                .matchScore(app.getMatchScore())
                .resumeId(app.getResumeId())
                .candidateId(app.getCandidateId())
                .candidateName(app.getCandidateName())
                .recruiterId(app.getRecruiterId())
                .recruiterEmail(app.getRecruiterEmail())
                .build();
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String jobId;
        private String jobTitle;
        private String companyName;
        private String status;
        private String appliedDate;
        private int matchScore;
        private Long resumeId;
        private String candidateId;
        private String candidateName;
        private String recruiterId;
        private String recruiterEmail;

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

        public Builder status(String status) {
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

        public Builder resumeId(Long resumeId) {
            this.resumeId = resumeId;
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

        public ApplicationResponse build() {
            ApplicationResponse response = new ApplicationResponse(id, jobId, jobTitle, companyName, status,
                    appliedDate, matchScore, candidateId, candidateName, recruiterId, recruiterEmail);
            response.setResumeId(resumeId);
            return response;
        }
    }
}

package com.jobportal.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class ApplicationRequest {

    @NotBlank(message = "jobId is required")
    private String jobId;

    @NotBlank(message = "candidateId is required")
    private String candidateId;

    private String jobTitle;
    private String companyName;
    private String status;
    private String appliedDate;
    private int matchScore;
    private Long resumeId;
    private String candidateName;
    private String recruiterId;
    private String recruiterEmail;

    public ApplicationRequest() {
    }

    public ApplicationRequest(String jobId, String candidateId, String jobTitle, String companyName,
            String status, String appliedDate, int matchScore, String candidateName,
            String recruiterId, String recruiterEmail) {
        this.jobId = jobId;
        this.candidateId = candidateId;
        this.jobTitle = jobTitle;
        this.companyName = companyName;
        this.status = status;
        this.appliedDate = appliedDate;
        this.matchScore = matchScore;
        this.candidateName = candidateName;
        this.recruiterId = recruiterId;
        this.recruiterEmail = recruiterEmail;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public String getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(String candidateId) {
        this.candidateId = candidateId;
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

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String jobId;
        private String candidateId;
        private String jobTitle;
        private String companyName;
        private String status;
        private String appliedDate;
        private int matchScore;
        private String candidateName;
        private String recruiterId;
        private String recruiterEmail;

        public Builder jobId(String jobId) {
            this.jobId = jobId;
            return this;
        }

        public Builder candidateId(String candidateId) {
            this.candidateId = candidateId;
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

        public ApplicationRequest build() {
            return new ApplicationRequest(jobId, candidateId, jobTitle, companyName, status,
                    appliedDate, matchScore, candidateName, recruiterId, recruiterEmail);
        }
    }
}

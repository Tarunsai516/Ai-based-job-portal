package com.jobportal.backend.dto;

import com.jobportal.backend.model.Application;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationResponse {

    private Long id;
    private String jobId;
    private String jobTitle;
    private String companyName;
    private String status;
    private String appliedDate;
    private int matchScore;
    private String candidateId;
    private String candidateName;
    private String recruiterId;
    private String recruiterEmail;

    public static ApplicationResponse fromEntity(Application app) {
        if (app == null) return null;
        return ApplicationResponse.builder()
                .id(app.getId())
                .jobId(app.getJobId())
                .jobTitle(app.getJobTitle())
                .companyName(app.getCompanyName())
                .status(app.getStatus())
                .appliedDate(app.getAppliedDate())
                .matchScore(app.getMatchScore())
                .candidateId(app.getCandidateId())
                .candidateName(app.getCandidateName())
                .recruiterId(app.getRecruiterId())
                .recruiterEmail(app.getRecruiterEmail())
                .build();
    }
}

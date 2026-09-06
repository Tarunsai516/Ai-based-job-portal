package com.jobportal.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
    private String candidateName;
    private String recruiterId;
    private String recruiterEmail;
}

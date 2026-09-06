package com.jobportal.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobRequest {

    private String companyId;

    @NotBlank(message = "Company name is required")
    private String companyName;

    private String companyLogo;

    @NotBlank(message = "Job title is required")
    private String title;

    @NotBlank(message = "Job location is required")
    private String location;

    private String salary;
    private String experience;
    private String type; // 'Remote', 'Hybrid', 'Onsite'
    private String description;
    private List<String> skills;
    private List<String> responsibilities;
    private List<String> qualifications;
    private List<String> benefits;
    private String recruiterId;
    private String recruiterName;
    private String recruiterEmail;
    private String postedTime;
}

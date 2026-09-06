package com.jobportal.backend.dto;

import com.jobportal.backend.model.Job;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobResponse {

    private Long id;
    private String companyId;
    private String companyName;
    private String companyLogo;
    private String title;
    private String location;
    private String salary;
    private String experience;
    private String type;
    private String description;
    private List<String> skills;
    private List<String> responsibilities;
    private List<String> qualifications;
    private List<String> benefits;
    private String recruiterId;
    private String recruiterName;
    private String recruiterEmail;
    private String postedTime;

    public static JobResponse fromEntity(Job job) {
        if (job == null) return null;
        return JobResponse.builder()
                .id(job.getId())
                .companyId(job.getCompanyId())
                .companyName(job.getCompanyName())
                .companyLogo(job.getCompanyLogo())
                .title(job.getTitle())
                .location(job.getLocation())
                .salary(job.getSalary())
                .experience(job.getExperience())
                .type(job.getType())
                .description(job.getDescription())
                .skills(job.getSkills())
                .responsibilities(job.getResponsibilities())
                .qualifications(job.getQualifications())
                .benefits(job.getBenefits())
                .recruiterId(job.getRecruiterId())
                .recruiterName(job.getRecruiterName())
                .recruiterEmail(job.getRecruiterEmail())
                .postedTime(job.getPostedTime())
                .build();
    }
}

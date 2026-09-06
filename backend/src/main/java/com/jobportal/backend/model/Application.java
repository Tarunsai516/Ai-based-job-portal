package com.jobportal.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "applications", indexes = {
    @Index(name = "idx_app_candidate_id", columnList = "candidateId"),
    @Index(name = "idx_app_recruiter_id", columnList = "recruiterId"),
    @Index(name = "idx_app_job_id", columnList = "jobId")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String jobId;
    private String jobTitle;
    private String companyName;
    private String status; // 'Applied', 'Reviewing', 'Shortlisted', 'Interviewing', 'Rejected'
    private String appliedDate;
    private int matchScore;
    private String candidateId;
    private String candidateName;
    private String recruiterId;
    private String recruiterEmail;
}

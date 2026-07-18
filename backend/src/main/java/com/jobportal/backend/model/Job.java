package com.jobportal.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyId;
    private String companyName;
    private String companyLogo;
    private String title;
    private String location;
    private String salary;
    private String experience;
    private String type; // 'Remote', 'Hybrid', 'Onsite'

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "job_skills", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill")
    private List<String> skills;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "job_responsibilities", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "responsibility", columnDefinition = "TEXT")
    private List<String> responsibilities;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "job_qualifications", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "qualification", columnDefinition = "TEXT")
    private List<String> qualifications;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "job_benefits", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "benefit", columnDefinition = "TEXT")
    private List<String> benefits;

    private String recruiterId;
    private String recruiterName;
    private String recruiterEmail;
    private String postedTime;
}

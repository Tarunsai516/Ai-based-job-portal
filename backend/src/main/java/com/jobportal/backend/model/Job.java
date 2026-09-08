package com.jobportal.backend.model;

import com.jobportal.backend.model.enums.JobStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "jobs", indexes = {
    @Index(name = "idx_job_title", columnList = "title"),
    @Index(name = "idx_job_location", columnList = "location"),
    @Index(name = "idx_job_type", columnList = "type"),
    @Index(name = "idx_job_status", columnList = "status"),
    @Index(name = "idx_job_recruiter_id", columnList = "recruiterId"),
    @Index(name = "idx_job_created_at", columnList = "createdAt")
})
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
    private List<String> skills = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "job_responsibilities", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "responsibility", columnDefinition = "TEXT")
    private List<String> responsibilities = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "job_qualifications", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "qualification", columnDefinition = "TEXT")
    private List<String> qualifications = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "job_benefits", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "benefit", columnDefinition = "TEXT")
    private List<String> benefits = new ArrayList<>();

    private String recruiterId;
    private String recruiterName;
    private String recruiterEmail;
    private String postedTime;

    @Enumerated(EnumType.STRING)
    private JobStatus status = JobStatus.ACTIVE;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    public Job() {}

    public Job(Long id, String companyId, String companyName, String companyLogo, String title,
               String location, String salary, String experience, String type, String description,
               List<String> skills, List<String> responsibilities, List<String> qualifications,
               List<String> benefits, String recruiterId, String recruiterName, String recruiterEmail,
               String postedTime, JobStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.companyId = companyId;
        this.companyName = companyName;
        this.companyLogo = companyLogo;
        this.title = title;
        this.location = location;
        this.salary = salary;
        this.experience = experience;
        this.type = type;
        this.description = description;
        this.skills = skills != null ? skills : new ArrayList<>();
        this.responsibilities = responsibilities != null ? responsibilities : new ArrayList<>();
        this.qualifications = qualifications != null ? qualifications : new ArrayList<>();
        this.benefits = benefits != null ? benefits : new ArrayList<>();
        this.recruiterId = recruiterId;
        this.recruiterName = recruiterName;
        this.recruiterEmail = recruiterEmail;
        this.postedTime = postedTime;
        this.status = status != null ? status : JobStatus.ACTIVE;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.updatedAt = updatedAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCompanyLogo() { return companyLogo; }
    public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getSalary() { return salary; }
    public void setSalary(String salary) { this.salary = salary; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public List<String> getResponsibilities() { return responsibilities; }
    public void setResponsibilities(List<String> responsibilities) { this.responsibilities = responsibilities; }

    public List<String> getQualifications() { return qualifications; }
    public void setQualifications(List<String> qualifications) { this.qualifications = qualifications; }

    public List<String> getBenefits() { return benefits; }
    public void setBenefits(List<String> benefits) { this.benefits = benefits; }

    public String getRecruiterId() { return recruiterId; }
    public void setRecruiterId(String recruiterId) { this.recruiterId = recruiterId; }

    public String getRecruiterName() { return recruiterName; }
    public void setRecruiterName(String recruiterName) { this.recruiterName = recruiterName; }

    public String getRecruiterEmail() { return recruiterEmail; }
    public void setRecruiterEmail(String recruiterEmail) { this.recruiterEmail = recruiterEmail; }

    public String getPostedTime() { return postedTime; }
    public void setPostedTime(String postedTime) { this.postedTime = postedTime; }

    public JobStatus getStatus() { return status; }
    public void setStatus(JobStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
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
        private List<String> skills = new ArrayList<>();
        private List<String> responsibilities = new ArrayList<>();
        private List<String> qualifications = new ArrayList<>();
        private List<String> benefits = new ArrayList<>();
        private String recruiterId;
        private String recruiterName;
        private String recruiterEmail;
        private String postedTime;
        private JobStatus status = JobStatus.ACTIVE;
        private LocalDateTime createdAt = LocalDateTime.now();
        private LocalDateTime updatedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder companyId(String companyId) { this.companyId = companyId; return this; }
        public Builder companyName(String companyName) { this.companyName = companyName; return this; }
        public Builder companyLogo(String companyLogo) { this.companyLogo = companyLogo; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder location(String location) { this.location = location; return this; }
        public Builder salary(String salary) { this.salary = salary; return this; }
        public Builder experience(String experience) { this.experience = experience; return this; }
        public Builder type(String type) { this.type = type; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder skills(List<String> skills) { this.skills = skills; return this; }
        public Builder responsibilities(List<String> responsibilities) { this.responsibilities = responsibilities; return this; }
        public Builder qualifications(List<String> qualifications) { this.qualifications = qualifications; return this; }
        public Builder benefits(List<String> benefits) { this.benefits = benefits; return this; }
        public Builder recruiterId(String recruiterId) { this.recruiterId = recruiterId; return this; }
        public Builder recruiterName(String recruiterName) { this.recruiterName = recruiterName; return this; }
        public Builder recruiterEmail(String recruiterEmail) { this.recruiterEmail = recruiterEmail; return this; }
        public Builder postedTime(String postedTime) { this.postedTime = postedTime; return this; }
        public Builder status(JobStatus status) { this.status = status; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Job build() {
            return new Job(id, companyId, companyName, companyLogo, title, location, salary, experience,
                    type, description, skills, responsibilities, qualifications, benefits, recruiterId,
                    recruiterName, recruiterEmail, postedTime, status, createdAt, updatedAt);
        }
    }
}

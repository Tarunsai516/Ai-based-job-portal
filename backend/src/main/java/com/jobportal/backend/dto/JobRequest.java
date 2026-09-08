package com.jobportal.backend.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

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

    public JobRequest() {}

    public JobRequest(String companyId, String companyName, String companyLogo, String title,
                      String location, String salary, String experience, String type,
                      String description, List<String> skills, List<String> responsibilities,
                      List<String> qualifications, List<String> benefits, String recruiterId,
                      String recruiterName, String recruiterEmail, String postedTime) {
        this.companyId = companyId;
        this.companyName = companyName;
        this.companyLogo = companyLogo;
        this.title = title;
        this.location = location;
        this.salary = salary;
        this.experience = experience;
        this.type = type;
        this.description = description;
        this.skills = skills;
        this.responsibilities = responsibilities;
        this.qualifications = qualifications;
        this.benefits = benefits;
        this.recruiterId = recruiterId;
        this.recruiterName = recruiterName;
        this.recruiterEmail = recruiterEmail;
        this.postedTime = postedTime;
    }

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

    public static Builder builder() { return new Builder(); }

    public static class Builder {
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

        public JobRequest build() {
            return new JobRequest(companyId, companyName, companyLogo, title, location, salary,
                    experience, type, description, skills, responsibilities, qualifications,
                    benefits, recruiterId, recruiterName, recruiterEmail, postedTime);
        }
    }
}

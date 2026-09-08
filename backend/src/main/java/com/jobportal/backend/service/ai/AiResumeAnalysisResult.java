package com.jobportal.backend.service.ai;

import java.util.List;

/**
 * Structured result from AI resume analysis.
 * This DTO is returned by AiProvider implementations.
 */
public class AiResumeAnalysisResult {
    private String name;
    private String email;
    private String phone;
    private List<String> skills;
    private List<EducationEntry> education;
    private List<ExperienceEntry> experience;
    private List<String> certifications;
    private List<String> projects;
    private List<String> technologies;
    private String summary;
    private double estimatedYearsOfExperience;

    public AiResumeAnalysisResult() {}

    public AiResumeAnalysisResult(String name, String email, String phone, List<String> skills,
                                 List<EducationEntry> education, List<ExperienceEntry> experience,
                                 List<String> certifications, List<String> projects,
                                 List<String> technologies, String summary,
                                 double estimatedYearsOfExperience) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.skills = skills;
        this.education = education;
        this.experience = experience;
        this.certifications = certifications;
        this.projects = projects;
        this.technologies = technologies;
        this.summary = summary;
        this.estimatedYearsOfExperience = estimatedYearsOfExperience;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public List<EducationEntry> getEducation() { return education; }
    public void setEducation(List<EducationEntry> education) { this.education = education; }

    public List<ExperienceEntry> getExperience() { return experience; }
    public void setExperience(List<ExperienceEntry> experience) { this.experience = experience; }

    public List<String> getCertifications() { return certifications; }
    public void setCertifications(List<String> certifications) { this.certifications = certifications; }

    public List<String> getProjects() { return projects; }
    public void setProjects(List<String> projects) { this.projects = projects; }

    public List<String> getTechnologies() { return technologies; }
    public void setTechnologies(List<String> technologies) { this.technologies = technologies; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public double getEstimatedYearsOfExperience() { return estimatedYearsOfExperience; }
    public void setEstimatedYearsOfExperience(double estimatedYearsOfExperience) { this.estimatedYearsOfExperience = estimatedYearsOfExperience; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String name;
        private String email;
        private String phone;
        private List<String> skills;
        private List<EducationEntry> education;
        private List<ExperienceEntry> experience;
        private List<String> certifications;
        private List<String> projects;
        private List<String> technologies;
        private String summary;
        private double estimatedYearsOfExperience;

        public Builder name(String name) { this.name = name; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder phone(String phone) { this.phone = phone; return this; }
        public Builder skills(List<String> skills) { this.skills = skills; return this; }
        public Builder education(List<EducationEntry> education) { this.education = education; return this; }
        public Builder experience(List<ExperienceEntry> experience) { this.experience = experience; return this; }
        public Builder certifications(List<String> certifications) { this.certifications = certifications; return this; }
        public Builder projects(List<String> projects) { this.projects = projects; return this; }
        public Builder technologies(List<String> technologies) { this.technologies = technologies; return this; }
        public Builder summary(String summary) { this.summary = summary; return this; }
        public Builder estimatedYearsOfExperience(double estimatedYearsOfExperience) { this.estimatedYearsOfExperience = estimatedYearsOfExperience; return this; }

        public AiResumeAnalysisResult build() {
            return new AiResumeAnalysisResult(name, email, phone, skills, education, experience,
                    certifications, projects, technologies, summary, estimatedYearsOfExperience);
        }
    }

    public static class EducationEntry {
        private String degree;
        private String institution;
        private String year;

        public EducationEntry() {}

        public EducationEntry(String degree, String institution, String year) {
            this.degree = degree;
            this.institution = institution;
            this.year = year;
        }

        public String getDegree() { return degree; }
        public void setDegree(String degree) { this.degree = degree; }

        public String getInstitution() { return institution; }
        public void setInstitution(String institution) { this.institution = institution; }

        public String getYear() { return year; }
        public void setYear(String year) { this.year = year; }

        public static EducationEntryBuilder builder() { return new EducationEntryBuilder(); }

        public static class EducationEntryBuilder {
            private String degree;
            private String institution;
            private String year;

            public EducationEntryBuilder degree(String degree) { this.degree = degree; return this; }
            public EducationEntryBuilder institution(String institution) { this.institution = institution; return this; }
            public EducationEntryBuilder year(String year) { this.year = year; return this; }

            public EducationEntry build() {
                return new EducationEntry(degree, institution, year);
            }
        }
    }

    public static class ExperienceEntry {
        private String title;
        private String company;
        private String duration;
        private String description;

        public ExperienceEntry() {}

        public ExperienceEntry(String title, String company, String duration, String description) {
            this.title = title;
            this.company = company;
            this.duration = duration;
            this.description = description;
        }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getCompany() { return company; }
        public void setCompany(String company) { this.company = company; }

        public String getDuration() { return duration; }
        public void setDuration(String duration) { this.duration = duration; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public static ExperienceEntryBuilder builder() { return new ExperienceEntryBuilder(); }

        public static class ExperienceEntryBuilder {
            private String title;
            private String company;
            private String duration;
            private String description;

            public ExperienceEntryBuilder title(String title) { this.title = title; return this; }
            public ExperienceEntryBuilder company(String company) { this.company = company; return this; }
            public ExperienceEntryBuilder duration(String duration) { this.duration = duration; return this; }
            public ExperienceEntryBuilder description(String description) { this.description = description; return this; }

            public ExperienceEntry build() {
                return new ExperienceEntry(title, company, duration, description);
            }
        }
    }
}

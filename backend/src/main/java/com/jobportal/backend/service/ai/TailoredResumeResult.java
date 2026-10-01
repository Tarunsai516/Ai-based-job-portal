package com.jobportal.backend.service.ai;

import java.util.List;

/**
 * Structured result from AI resume tailoring.
 * Contains all resume sections in a structured format that can be
 * rendered into a professional DOCX document.
 */
public class TailoredResumeResult {
    private String name;
    private String email;
    private String phone;
    private String location;
    private String summary;
    private List<String> skills;
    private List<ExperienceEntry> experience;
    private List<EducationEntry> education;
    private List<String> certifications;
    private List<ProjectEntry> projects;

    private List<SectionImprovement> sectionImprovements;

    public TailoredResumeResult() {}

    public List<SectionImprovement> getSectionImprovements() { return sectionImprovements; }
    public void setSectionImprovements(List<SectionImprovement> sectionImprovements) { this.sectionImprovements = sectionImprovements; }

    // --- Getters & Setters ---

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public List<ExperienceEntry> getExperience() { return experience; }
    public void setExperience(List<ExperienceEntry> experience) { this.experience = experience; }

    public List<EducationEntry> getEducation() { return education; }
    public void setEducation(List<EducationEntry> education) { this.education = education; }

    public List<String> getCertifications() { return certifications; }
    public void setCertifications(List<String> certifications) { this.certifications = certifications; }

    public List<ProjectEntry> getProjects() { return projects; }
    public void setProjects(List<ProjectEntry> projects) { this.projects = projects; }

    // --- Inner classes ---

    public static class ExperienceEntry {
        private String title;
        private String company;
        private String duration;
        private List<String> bullets;

        public ExperienceEntry() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getCompany() { return company; }
        public void setCompany(String company) { this.company = company; }

        public String getDuration() { return duration; }
        public void setDuration(String duration) { this.duration = duration; }

        public List<String> getBullets() { return bullets; }
        public void setBullets(List<String> bullets) { this.bullets = bullets; }
    }

    public static class EducationEntry {
        private String degree;
        private String institution;
        private String year;

        public EducationEntry() {}

        public String getDegree() { return degree; }
        public void setDegree(String degree) { this.degree = degree; }

        public String getInstitution() { return institution; }
        public void setInstitution(String institution) { this.institution = institution; }

        public String getYear() { return year; }
        public void setYear(String year) { this.year = year; }
    }

    public static class ProjectEntry {
        private String name;
        private String description;
        private List<String> technologies;

        public ProjectEntry() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public List<String> getTechnologies() { return technologies; }
        public void setTechnologies(List<String> technologies) { this.technologies = technologies; }
    }

    public static class SectionImprovement {
        private String section;
        private String whyImproved;
        private String keyChanges;

        public SectionImprovement() {}

        public SectionImprovement(String section, String whyImproved, String keyChanges) {
            this.section = section;
            this.whyImproved = whyImproved;
            this.keyChanges = keyChanges;
        }

        public String getSection() { return section; }
        public void setSection(String section) { this.section = section; }

        public String getWhyImproved() { return whyImproved; }
        public void setWhyImproved(String whyImproved) { this.whyImproved = whyImproved; }

        public String getKeyChanges() { return keyChanges; }
        public void setKeyChanges(String keyChanges) { this.keyChanges = keyChanges; }
    }
}

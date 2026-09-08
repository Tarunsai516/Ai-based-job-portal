package com.jobportal.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "candidates", indexes = {
    @Index(name = "idx_candidate_user_id", columnList = "userId"),
    @Index(name = "idx_candidate_email", columnList = "email")
})
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Link to the User entity. */
    private Long userId;

    private String name;
    private String title;
    private String email;
    private String phone;
    private String avatar;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "candidate_skills", joinColumns = @JoinColumn(name = "candidate_id"))
    @Column(name = "skill")
    private List<String> skills = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "candidate_missing_skills", joinColumns = @JoinColumn(name = "candidate_id"))
    @Column(name = "missing_skill")
    private List<String> missingSkills = new ArrayList<>();

    private String experience;
    private String education;
    private int matchScore;
    private String location;
    private String resumeUrl;

    @Column(columnDefinition = "TEXT")
    private String summary;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    public Candidate() {}

    public Candidate(Long id, Long userId, String name, String title, String email, String phone,
                     String avatar, List<String> skills, List<String> missingSkills, String experience,
                     String education, int matchScore, String location, String resumeUrl, String summary,
                     LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.title = title;
        this.email = email;
        this.phone = phone;
        this.avatar = avatar;
        this.skills = skills != null ? skills : new ArrayList<>();
        this.missingSkills = missingSkills != null ? missingSkills : new ArrayList<>();
        this.experience = experience;
        this.education = education;
        this.matchScore = matchScore;
        this.location = location;
        this.resumeUrl = resumeUrl;
        this.summary = summary;
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

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }

    public int getMatchScore() { return matchScore; }
    public void setMatchScore(int matchScore) { this.matchScore = matchScore; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

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
        private Long userId;
        private String name;
        private String title;
        private String email;
        private String phone;
        private String avatar;
        private List<String> skills = new ArrayList<>();
        private List<String> missingSkills = new ArrayList<>();
        private String experience;
        private String education;
        private int matchScore;
        private String location;
        private String resumeUrl;
        private String summary;
        private LocalDateTime createdAt = LocalDateTime.now();
        private LocalDateTime updatedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder phone(String phone) { this.phone = phone; return this; }
        public Builder avatar(String avatar) { this.avatar = avatar; return this; }
        public Builder skills(List<String> skills) { this.skills = skills; return this; }
        public Builder missingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; return this; }
        public Builder experience(String experience) { this.experience = experience; return this; }
        public Builder education(String education) { this.education = education; return this; }
        public Builder matchScore(int matchScore) { this.matchScore = matchScore; return this; }
        public Builder location(String location) { this.location = location; return this; }
        public Builder resumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; return this; }
        public Builder summary(String summary) { this.summary = summary; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Candidate build() {
            return new Candidate(id, userId, name, title, email, phone, avatar, skills, missingSkills,
                    experience, education, matchScore, location, resumeUrl, summary, createdAt, updatedAt);
        }
    }
}

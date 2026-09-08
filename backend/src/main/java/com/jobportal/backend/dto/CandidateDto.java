package com.jobportal.backend.dto;

import com.jobportal.backend.model.Candidate;
import java.util.List;

public class CandidateDto {
    private Long id;
    private String name;
    private String title;
    private String email;
    private String phone;
    private String avatar;
    private List<String> skills;
    private List<String> missingSkills;
    private String experience;
    private String education;
    private int matchScore;
    private String location;
    private String resumeUrl;
    private String summary;

    public CandidateDto() {}

    public CandidateDto(Long id, String name, String title, String email, String phone, String avatar,
                        List<String> skills, List<String> missingSkills, String experience, String education,
                        int matchScore, String location, String resumeUrl, String summary) {
        this.id = id;
        this.name = name;
        this.title = title;
        this.email = email;
        this.phone = phone;
        this.avatar = avatar;
        this.skills = skills;
        this.missingSkills = missingSkills;
        this.experience = experience;
        this.education = education;
        this.matchScore = matchScore;
        this.location = location;
        this.resumeUrl = resumeUrl;
        this.summary = summary;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public static CandidateDto fromEntity(Candidate candidate) {
        if (candidate == null) return null;
        return CandidateDto.builder()
                .id(candidate.getId())
                .name(candidate.getName())
                .title(candidate.getTitle())
                .email(candidate.getEmail())
                .phone(candidate.getPhone())
                .avatar(candidate.getAvatar())
                .skills(candidate.getSkills())
                .missingSkills(candidate.getMissingSkills())
                .experience(candidate.getExperience())
                .education(candidate.getEducation())
                .matchScore(candidate.getMatchScore())
                .location(candidate.getLocation())
                .resumeUrl(candidate.getResumeUrl())
                .summary(candidate.getSummary())
                .build();
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String name;
        private String title;
        private String email;
        private String phone;
        private String avatar;
        private List<String> skills;
        private List<String> missingSkills;
        private String experience;
        private String education;
        private int matchScore;
        private String location;
        private String resumeUrl;
        private String summary;

        public Builder id(Long id) { this.id = id; return this; }
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

        public CandidateDto build() {
            return new CandidateDto(id, name, title, email, phone, avatar, skills, missingSkills,
                    experience, education, matchScore, location, resumeUrl, summary);
        }
    }
}

package com.jobportal.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "match_results", indexes = {
    @Index(name = "idx_match_candidate_id", columnList = "candidateId"),
    @Index(name = "idx_match_job_id", columnList = "jobId"),
    @Index(name = "idx_match_overall_score", columnList = "overallScore")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_candidate_job_match", columnNames = {"candidateId", "jobId"})
})
public class MatchResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long candidateId;

    @Column(nullable = false)
    private Long jobId;

    /** Overall weighted match score (0-100). */
    private double overallScore;

    /** Semantic/keyword similarity score (0-100). */
    private double semanticScore;

    /** Skill overlap score (0-100). */
    private double skillScore;

    /** Experience match score (0-100). */
    private double experienceScore;

    /** Location/work-mode match score (0-100). */
    private double locationScore;

    /** Education match score (0-100). */
    private double educationScore;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "match_matched_skills", joinColumns = @JoinColumn(name = "match_result_id"))
    @Column(name = "skill")
    private List<String> matchedSkills = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "match_missing_skills", joinColumns = @JoinColumn(name = "match_result_id"))
    @Column(name = "skill")
    private List<String> missingSkills = new ArrayList<>();

    /** Structured explanation of the match. */
    @Column(columnDefinition = "TEXT")
    private String explanation;

    private LocalDateTime calculatedAt = LocalDateTime.now();

    public MatchResult() {}

    public MatchResult(Long id, Long candidateId, Long jobId, double overallScore, double semanticScore,
                       double skillScore, double experienceScore, double locationScore, double educationScore,
                       List<String> matchedSkills, List<String> missingSkills, String explanation,
                       LocalDateTime calculatedAt) {
        this.id = id;
        this.candidateId = candidateId;
        this.jobId = jobId;
        this.overallScore = overallScore;
        this.semanticScore = semanticScore;
        this.skillScore = skillScore;
        this.experienceScore = experienceScore;
        this.locationScore = locationScore;
        this.educationScore = educationScore;
        this.matchedSkills = matchedSkills != null ? matchedSkills : new ArrayList<>();
        this.missingSkills = missingSkills != null ? missingSkills : new ArrayList<>();
        this.explanation = explanation;
        this.calculatedAt = calculatedAt != null ? calculatedAt : LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public double getOverallScore() { return overallScore; }
    public void setOverallScore(double overallScore) { this.overallScore = overallScore; }

    public double getSemanticScore() { return semanticScore; }
    public void setSemanticScore(double semanticScore) { this.semanticScore = semanticScore; }

    public double getSkillScore() { return skillScore; }
    public void setSkillScore(double skillScore) { this.skillScore = skillScore; }

    public double getExperienceScore() { return experienceScore; }
    public void setExperienceScore(double experienceScore) { this.experienceScore = experienceScore; }

    public double getLocationScore() { return locationScore; }
    public void setLocationScore(double locationScore) { this.locationScore = locationScore; }

    public double getEducationScore() { return educationScore; }
    public void setEducationScore(double educationScore) { this.educationScore = educationScore; }

    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public LocalDateTime getCalculatedAt() { return calculatedAt; }
    public void setCalculatedAt(LocalDateTime calculatedAt) { this.calculatedAt = calculatedAt; }

    // Builder
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Long candidateId;
        private Long jobId;
        private double overallScore;
        private double semanticScore;
        private double skillScore;
        private double experienceScore;
        private double locationScore;
        private double educationScore;
        private List<String> matchedSkills = new ArrayList<>();
        private List<String> missingSkills = new ArrayList<>();
        private String explanation;
        private LocalDateTime calculatedAt = LocalDateTime.now();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder candidateId(Long candidateId) { this.candidateId = candidateId; return this; }
        public Builder jobId(Long jobId) { this.jobId = jobId; return this; }
        public Builder overallScore(double overallScore) { this.overallScore = overallScore; return this; }
        public Builder semanticScore(double semanticScore) { this.semanticScore = semanticScore; return this; }
        public Builder skillScore(double skillScore) { this.skillScore = skillScore; return this; }
        public Builder experienceScore(double experienceScore) { this.experienceScore = experienceScore; return this; }
        public Builder locationScore(double locationScore) { this.locationScore = locationScore; return this; }
        public Builder educationScore(double educationScore) { this.educationScore = educationScore; return this; }
        public Builder matchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; return this; }
        public Builder missingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; return this; }
        public Builder explanation(String explanation) { this.explanation = explanation; return this; }
        public Builder calculatedAt(LocalDateTime calculatedAt) { this.calculatedAt = calculatedAt; return this; }

        public MatchResult build() {
            return new MatchResult(id, candidateId, jobId, overallScore, semanticScore, skillScore,
                    experienceScore, locationScore, educationScore, matchedSkills, missingSkills,
                    explanation, calculatedAt);
        }
    }
}

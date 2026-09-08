package com.jobportal.backend.model;

import com.jobportal.backend.model.enums.SkillProficiency;
import jakarta.persistence.*;

@Entity
@Table(name = "candidate_skills_normalized", indexes = {
    @Index(name = "idx_cs_candidate_id", columnList = "candidateId"),
    @Index(name = "idx_cs_skill_id", columnList = "skill_id")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_candidate_skill", columnNames = {"candidateId", "skill_id"})
})
public class CandidateSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long candidateId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Enumerated(EnumType.STRING)
    private SkillProficiency proficiency = SkillProficiency.INTERMEDIATE;

    private Double yearsOfExperience = 0.0;

    public CandidateSkill() {}

    public CandidateSkill(Long id, Long candidateId, Skill skill, SkillProficiency proficiency, Double yearsOfExperience) {
        this.id = id;
        this.candidateId = candidateId;
        this.skill = skill;
        this.proficiency = proficiency != null ? proficiency : SkillProficiency.INTERMEDIATE;
        this.yearsOfExperience = yearsOfExperience != null ? yearsOfExperience : 0.0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public SkillProficiency getProficiency() { return proficiency; }
    public void setProficiency(SkillProficiency proficiency) { this.proficiency = proficiency; }

    public Double getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Double yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long candidateId;
        private Skill skill;
        private SkillProficiency proficiency = SkillProficiency.INTERMEDIATE;
        private Double yearsOfExperience = 0.0;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder candidateId(Long candidateId) { this.candidateId = candidateId; return this; }
        public Builder skill(Skill skill) { this.skill = skill; return this; }
        public Builder proficiency(SkillProficiency proficiency) { this.proficiency = proficiency; return this; }
        public Builder yearsOfExperience(Double yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; return this; }

        public CandidateSkill build() {
            return new CandidateSkill(id, candidateId, skill, proficiency, yearsOfExperience);
        }
    }
}

package com.jobportal.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "job_skills_normalized", indexes = {
    @Index(name = "idx_js_job_id", columnList = "jobId"),
    @Index(name = "idx_js_skill_id", columnList = "skill_id")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_job_skill", columnNames = {"jobId", "skill_id"})
})
public class JobSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long jobId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    private boolean required = true;

    /** Importance weight from 1 (nice-to-have) to 5 (critical). */
    private int importance = 3;

    public JobSkill() {}

    public JobSkill(Long id, Long jobId, Skill skill, boolean required, int importance) {
        this.id = id;
        this.jobId = jobId;
        this.skill = skill;
        this.required = required;
        this.importance = importance;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public boolean isRequired() { return required; }
    public void setRequired(boolean required) { this.required = required; }

    public int getImportance() { return importance; }
    public void setImportance(int importance) { this.importance = importance; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long jobId;
        private Skill skill;
        private boolean required = true;
        private int importance = 3;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder jobId(Long jobId) { this.jobId = jobId; return this; }
        public Builder skill(Skill skill) { this.skill = skill; return this; }
        public Builder required(boolean required) { this.required = required; return this; }
        public Builder importance(int importance) { this.importance = importance; return this; }

        public JobSkill build() {
            return new JobSkill(id, jobId, skill, required, importance);
        }
    }
}

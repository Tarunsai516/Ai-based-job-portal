package com.jobportal.backend.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class MatchSkillGap {
    private String skill;
    private String severity;
    private String reason;

    public MatchSkillGap() {
    }

    public MatchSkillGap(String skill, String severity, String reason) {
        this.skill = skill;
        this.severity = severity;
        this.reason = reason;
    }

    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}

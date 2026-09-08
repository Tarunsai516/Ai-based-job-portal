package com.jobportal.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "skills", indexes = {
    @Index(name = "idx_skill_normalized_name", columnList = "normalizedName", unique = true)
})
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String normalizedName;

    private String category; // e.g., "PROGRAMMING_LANGUAGE", "FRAMEWORK", "DATABASE", "TOOL"

    public Skill() {}

    public Skill(Long id, String name, String normalizedName, String category) {
        this.id = id;
        this.name = name;
        this.normalizedName = normalizedName;
        this.category = category;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getNormalizedName() { return normalizedName; }
    public void setNormalizedName(String normalizedName) { this.normalizedName = normalizedName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String name;
        private String normalizedName;
        private String category;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder normalizedName(String normalizedName) { this.normalizedName = normalizedName; return this; }
        public Builder category(String category) { this.category = category; return this; }

        public Skill build() {
            return new Skill(id, name, normalizedName, category);
        }
    }
}

package com.jobportal.backend.service;

import com.jobportal.backend.model.Skill;
import com.jobportal.backend.repository.SkillRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for normalized skill management.
 * Ensures skills are stored once with a canonical name.
 */
@Service
public class SkillService {

    private static final Logger logger = LoggerFactory.getLogger(SkillService.class);

    private static final Map<String, String> ALIASES = Map.ofEntries(
            Map.entry("js", "javascript"),
            Map.entry("ts", "typescript"),
            Map.entry("reactjs", "react"),
            Map.entry("react.js", "react"),
            Map.entry("nodejs", "node.js"),
            Map.entry("postgres", "postgresql"),
            Map.entry("springboot", "spring boot"),
            Map.entry("spring-boot", "spring boot"),
            Map.entry("core java", "java"),
            Map.entry("java se", "java"),
            Map.entry("restful api", "rest api"),
            Map.entry("rest apis", "rest api"),
            Map.entry("restful apis", "rest api"),
            Map.entry("k8s", "kubernetes")
    );

    @Autowired
    private SkillRepository skillRepository;

    /**
     * Normalize a skill name: lowercase, trim, collapse whitespace.
     */
    public String normalize(String skillName) {
        if (skillName == null) return "";
        String normalized = skillName.trim().toLowerCase().replaceAll("[._-]+", " ")
                .replaceAll("\\s+", " ");
        String compact = normalized.replace(" ", "");
        return ALIASES.getOrDefault(normalized, ALIASES.getOrDefault(compact, normalized));
    }

    /**
     * Find or create a Skill entity for the given name.
     */
    @Transactional
    public Skill findOrCreate(String skillName) {
        String normalized = normalize(skillName);
        if (normalized.isEmpty()) return null;

        return skillRepository.findByNormalizedName(normalized)
                .orElseGet(() -> {
                    logger.info("Creating new skill: {}", skillName);
                    return skillRepository.save(Skill.builder()
                            .name(skillName.trim())
                            .normalizedName(normalized)
                            .category(categorize(normalized))
                            .build());
                });
    }

    /**
     * Find or create skills for a list of names.
     */
    @Transactional
    public List<Skill> findOrCreateAll(List<String> skillNames) {
        if (skillNames == null || skillNames.isEmpty()) return List.of();
        return skillNames.stream()
                .map(this::findOrCreate)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Skill> searchSkills(String query) {
        return skillRepository.findByNameContainingIgnoreCase(query);
    }

    @Transactional(readOnly = true)
    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    /**
     * Auto-categorize a skill based on known patterns.
     */
    private String categorize(String normalized) {
        Set<String> languages = Set.of("java", "python", "javascript", "typescript", "c++", "c#",
                "go", "rust", "ruby", "php", "swift", "kotlin", "r", "scala");
        Set<String> frameworks = Set.of("react", "angular", "vue", "vue.js", "spring", "spring boot",
                "django", "flask", "express", "express.js", "next.js", "rails", "laravel", "fastapi",
                ".net", "asp.net", "node.js", "nodejs");
        Set<String> databases = Set.of("mysql", "postgresql", "postgres", "mongodb", "redis",
                "elasticsearch", "cassandra", "oracle", "sqlite", "dynamodb", "mariadb");
        Set<String> devops = Set.of("docker", "kubernetes", "k8s", "terraform", "ansible",
                "jenkins", "ci/cd", "aws", "azure", "gcp", "google cloud", "heroku");
        Set<String> tools = Set.of("git", "github", "gitlab", "jira", "confluence",
                "maven", "gradle", "npm", "yarn", "webpack", "vite");

        if (languages.contains(normalized)) return "PROGRAMMING_LANGUAGE";
        if (frameworks.contains(normalized)) return "FRAMEWORK";
        if (databases.contains(normalized)) return "DATABASE";
        if (devops.contains(normalized)) return "DEVOPS";
        if (tools.contains(normalized)) return "TOOL";
        return "OTHER";
    }
}

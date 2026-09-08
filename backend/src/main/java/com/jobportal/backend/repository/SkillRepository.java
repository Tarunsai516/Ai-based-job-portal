package com.jobportal.backend.repository;

import com.jobportal.backend.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    Optional<Skill> findByNormalizedName(String normalizedName);
    List<Skill> findByNormalizedNameIn(List<String> normalizedNames);
    List<Skill> findByCategory(String category);
    List<Skill> findByNameContainingIgnoreCase(String name);
}

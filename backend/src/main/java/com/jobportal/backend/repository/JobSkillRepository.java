package com.jobportal.backend.repository;

import com.jobportal.backend.model.JobSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobSkillRepository extends JpaRepository<JobSkill, Long> {
    List<JobSkill> findByJobId(Long jobId);
    void deleteByJobId(Long jobId);
}

package com.jobportal.backend.repository;

import com.jobportal.backend.model.CandidateSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CandidateSkillRepository extends JpaRepository<CandidateSkill, Long> {
    List<CandidateSkill> findByCandidateId(Long candidateId);
    void deleteByCandidateId(Long candidateId);
}

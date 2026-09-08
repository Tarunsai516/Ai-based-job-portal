package com.jobportal.backend.repository;

import com.jobportal.backend.model.MatchResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MatchResultRepository extends JpaRepository<MatchResult, Long> {
    Optional<MatchResult> findByCandidateIdAndJobId(Long candidateId, Long jobId);
    List<MatchResult> findByCandidateIdOrderByOverallScoreDesc(Long candidateId);
    List<MatchResult> findByJobIdOrderByOverallScoreDesc(Long jobId);
    Page<MatchResult> findByCandidateIdOrderByOverallScoreDesc(Long candidateId, Pageable pageable);
    Page<MatchResult> findByJobIdOrderByOverallScoreDesc(Long jobId, Pageable pageable);
}

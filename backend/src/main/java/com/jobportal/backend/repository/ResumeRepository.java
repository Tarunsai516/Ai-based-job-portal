package com.jobportal.backend.repository;

import com.jobportal.backend.model.Resume;
import com.jobportal.backend.model.enums.ResumeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByCandidateId(Long candidateId);
    Optional<Resume> findTopByCandidateIdOrderByCreatedAtDesc(Long candidateId);
    List<Resume> findByStatus(ResumeStatus status);
    List<Resume> findByUserId(Long userId);
}

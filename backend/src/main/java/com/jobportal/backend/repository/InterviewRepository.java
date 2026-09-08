package com.jobportal.backend.repository;

import com.jobportal.backend.model.Interview;
import com.jobportal.backend.model.enums.InterviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByApplicationId(Long applicationId);
    List<Interview> findByCandidateId(Long candidateId);
    List<Interview> findByRecruiterId(Long recruiterId);
    List<Interview> findByStatus(InterviewStatus status);
    List<Interview> findByJobId(Long jobId);
}

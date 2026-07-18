package com.jobportal.backend.repository;

import com.jobportal.backend.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByCandidateId(String candidateId);
    List<Application> findByRecruiterId(String recruiterId);
    List<Application> findByRecruiterEmail(String recruiterEmail);
    List<Application> findByJobId(String jobId);
}

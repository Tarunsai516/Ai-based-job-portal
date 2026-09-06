package com.jobportal.backend.service;

import com.jobportal.backend.common.exception.BadRequestException;
import com.jobportal.backend.common.exception.DuplicateResourceException;
import com.jobportal.backend.dto.ApplicationRequest;
import com.jobportal.backend.dto.ApplicationResponse;
import com.jobportal.backend.model.Application;
import com.jobportal.backend.model.Job;
import com.jobportal.backend.repository.ApplicationRepository;
import com.jobportal.backend.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private static final Logger logger = LoggerFactory.getLogger(ApplicationService.class);

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplications(String candidateId, String recruiterId, String recruiterEmail) {
        logger.info("Fetching applications - candidateId: {}, recruiterId: {}, recruiterEmail: {}",
                candidateId, recruiterId, recruiterEmail);

        List<Application> apps;
        if (candidateId != null && !candidateId.isEmpty()) {
            apps = applicationRepository.findByCandidateId(candidateId);
        } else if (recruiterId != null && !recruiterId.isEmpty()) {
            apps = applicationRepository.findByRecruiterId(recruiterId);
        } else if (recruiterEmail != null && !recruiterEmail.isEmpty()) {
            apps = applicationRepository.findByRecruiterEmail(recruiterEmail);
        } else {
            apps = applicationRepository.findAll();
        }

        return apps.stream()
                .map(ApplicationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApplicationResponse applyToJob(ApplicationRequest request) {
        logger.info("Candidate {} applying to job {}", request.getCandidateId(), request.getJobId());

        if (request.getJobId() == null || request.getCandidateId() == null) {
            throw new BadRequestException("jobId and candidateId are required");
        }

        // Avoid duplicate applications
        List<Application> candidateApps = applicationRepository.findByCandidateId(request.getCandidateId());
        boolean alreadyApplied = candidateApps.stream()
                .anyMatch(app -> app.getJobId() != null && app.getJobId().equals(request.getJobId()));

        if (alreadyApplied) {
            throw new DuplicateResourceException("Already applied to this job");
        }

        String recruiterId = request.getRecruiterId();
        String recruiterEmail = request.getRecruiterEmail();
        String companyName = request.getCompanyName();
        String jobTitle = request.getJobTitle();

        try {
            Long jobIdNum = Long.parseLong(request.getJobId());
            Optional<Job> targetJobOpt = jobRepository.findById(jobIdNum);
            if (targetJobOpt.isPresent()) {
                Job targetJob = targetJobOpt.get();
                if (recruiterId == null || recruiterId.isEmpty()) recruiterId = targetJob.getRecruiterId();
                if (recruiterEmail == null || recruiterEmail.isEmpty()) recruiterEmail = targetJob.getRecruiterEmail();
                if (companyName == null || companyName.isEmpty()) companyName = targetJob.getCompanyName();
                if (jobTitle == null || jobTitle.isEmpty()) jobTitle = targetJob.getTitle();
            }
        } catch (NumberFormatException ignored) {}

        Application application = Application.builder()
                .jobId(request.getJobId())
                .jobTitle(jobTitle)
                .companyName(companyName)
                .status(request.getStatus() != null ? request.getStatus() : "Applied")
                .appliedDate(request.getAppliedDate() != null ? request.getAppliedDate() : LocalDate.now().toString())
                .matchScore(request.getMatchScore() != 0 ? request.getMatchScore() : 85)
                .candidateId(request.getCandidateId())
                .candidateName(request.getCandidateName())
                .recruiterId(recruiterId)
                .recruiterEmail(recruiterEmail)
                .build();

        Application savedApp = applicationRepository.save(application);
        return ApplicationResponse.fromEntity(savedApp);
    }
}

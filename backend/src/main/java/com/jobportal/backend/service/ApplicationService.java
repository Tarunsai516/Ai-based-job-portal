package com.jobportal.backend.service;

import com.jobportal.backend.common.exception.BadRequestException;
import com.jobportal.backend.common.exception.DuplicateResourceException;
import com.jobportal.backend.common.exception.ForbiddenException;
import com.jobportal.backend.dto.ApplicationRequest;
import com.jobportal.backend.dto.ApplicationResponse;
import com.jobportal.backend.model.Application;
import com.jobportal.backend.model.Job;
import com.jobportal.backend.model.MatchResult;
import com.jobportal.backend.model.enums.ApplicationStatus;
import com.jobportal.backend.model.enums.AuditAction;
import com.jobportal.backend.repository.ApplicationRepository;
import com.jobportal.backend.repository.JobRepository;
import com.jobportal.backend.repository.CandidateRepository;
import com.jobportal.backend.security.CustomUserDetails;
import com.jobportal.backend.security.SecurityUtils;
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

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private MatchingService matchingService;

    @Autowired
    private AuditService auditService;

    @Autowired
    private NotificationService notificationService;

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

        // Calculate real match score
        int calculatedMatchScore = 0;
        try {
            Long jobIdNum = Long.parseLong(request.getJobId());
            Optional<Job> targetJobOpt = jobRepository.findById(jobIdNum);
            if (targetJobOpt.isPresent()) {
                Job targetJob = targetJobOpt.get();
                if (recruiterId == null || recruiterId.isEmpty())
                    recruiterId = targetJob.getRecruiterId();
                if (recruiterEmail == null || recruiterEmail.isEmpty())
                    recruiterEmail = targetJob.getRecruiterEmail();
                if (companyName == null || companyName.isEmpty())
                    companyName = targetJob.getCompanyName();
                if (jobTitle == null || jobTitle.isEmpty())
                    jobTitle = targetJob.getTitle();

                // Calculate REAL match score using the matching engine
                try {
                    Long candidateIdNum = Long.parseLong(request.getCandidateId());
                    MatchResult match = matchingService.calculateMatch(candidateIdNum, jobIdNum);
                    calculatedMatchScore = (int) Math.round(match.getOverallScore());
                } catch (Exception e) {
                    logger.warn("Match calculation failed, using 0: {}", e.getMessage());
                }
            }
        } catch (NumberFormatException ignored) {
        }

        Application application = Application.builder()
                .jobId(request.getJobId())
                .jobTitle(jobTitle)
                .companyName(companyName)
                .status(ApplicationStatus.APPLIED)
                .appliedDate(request.getAppliedDate() != null ? request.getAppliedDate() : LocalDate.now().toString())
                .matchScore(calculatedMatchScore)
                .candidateId(request.getCandidateId())
                .candidateName(request.getCandidateName())
                .recruiterId(recruiterId)
                .recruiterEmail(recruiterEmail)
                .build();

        Application savedApp = applicationRepository.save(application);

        auditService.log(AuditAction.APPLICATION_CREATED, "Application",
                String.valueOf(savedApp.getId()),
                "Job: " + jobTitle + ", Candidate: " + request.getCandidateName());

        // Notify recruiter
        if (recruiterId != null) {
            try {
                notificationService.createNotification(
                        Long.parseLong(recruiterId),
                        "recruiter",
                        "New Application",
                        request.getCandidateName() + " applied for " + jobTitle,
                        "APPLICATION");
            } catch (NumberFormatException ignored) {
            }
        }

        return ApplicationResponse.fromEntity(savedApp);
    }

    /**
     * Update application status with state machine validation.
     * Backend enforces valid transitions — frontend cannot set arbitrary statuses.
     */
    @Transactional
    public ApplicationResponse updateApplicationStatus(Long applicationId, String newStatusStr) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new BadRequestException("Application not found: " + applicationId));

        CustomUserDetails currentUser = SecurityUtils.getCurrentUserDetails();
        boolean isAdmin = currentUser != null && "ADMIN".equalsIgnoreCase(currentUser.getRole());
        boolean ownsApplication = currentUser != null && "RECRUITER".equalsIgnoreCase(currentUser.getRole())
                && String.valueOf(currentUser.getId()).equals(application.getRecruiterId());
        if (!isAdmin && !ownsApplication) {
            throw new ForbiddenException("Only the job's recruiter can update this application");
        }

        ApplicationStatus currentStatus = application.getStatus();
        if (currentStatus == null)
            currentStatus = ApplicationStatus.APPLIED;

        ApplicationStatus newStatus = Application.parseStatus(newStatusStr);

        // Validate state transition
        if (!currentStatus.canTransitionTo(newStatus)) {
            throw new BadRequestException(
                    "Invalid status transition: " + currentStatus + " → " + newStatus +
                            ". Allowed transitions from " + currentStatus + ": " +
                            getValidTransitions(currentStatus));
        }

        application.setStatus(newStatus);
        Application saved = applicationRepository.save(application);

        auditService.log(AuditAction.APPLICATION_STATUS_CHANGED, "Application",
                String.valueOf(applicationId),
                "Status: " + currentStatus + " → " + newStatus);

        // Notify candidate
        if (application.getCandidateId() != null) {
            try {
                Long candidateId = Long.parseLong(application.getCandidateId());
                Long candidateUserId = candidateRepository.findById(candidateId)
                        .map(candidate -> candidate.getUserId())
                        .orElse(null);
                if (candidateUserId == null)
                    return ApplicationResponse.fromEntity(saved);
                notificationService.createNotification(
                        candidateUserId,
                        "seeker",
                        "Application Update",
                        "Your application for " + application.getJobTitle() + " status changed to " +
                                application.getStatusString(),
                        "APPLICATION");
            } catch (NumberFormatException ignored) {
            }
        }

        return ApplicationResponse.fromEntity(saved);
    }

    private String getValidTransitions(ApplicationStatus status) {
        List<String> valid = new java.util.ArrayList<>();
        for (ApplicationStatus target : ApplicationStatus.values()) {
            if (status.canTransitionTo(target))
                valid.add(target.name());
        }
        return String.join(", ", valid);
    }
}

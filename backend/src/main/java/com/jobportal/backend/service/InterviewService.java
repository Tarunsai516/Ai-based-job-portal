package com.jobportal.backend.service;

import com.jobportal.backend.common.exception.BadRequestException;
import com.jobportal.backend.common.exception.ResourceNotFoundException;
import com.jobportal.backend.model.Application;
import com.jobportal.backend.model.Interview;
import com.jobportal.backend.model.enums.*;
import com.jobportal.backend.repository.ApplicationRepository;
import com.jobportal.backend.repository.CandidateRepository;
import com.jobportal.backend.repository.InterviewRepository;
import com.jobportal.backend.security.CustomUserDetails;
import com.jobportal.backend.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for interview scheduling and management.
 */
@Service
public class InterviewService {

    private static final Logger logger = LoggerFactory.getLogger(InterviewService.class);

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private AuditService auditService;

    @Autowired
    private NotificationService notificationService;

    /**
     * Schedule an interview for an application.
     */
    @Transactional
    public Interview scheduleInterview(Long applicationId, LocalDateTime scheduledAt,
            int durationMinutes, InterviewType type,
            String meetingLink, String notes,
            Long recruiterId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        CustomUserDetails currentUser = SecurityUtils.getCurrentUserDetails();
        if (currentUser == null || !"RECRUITER".equalsIgnoreCase(currentUser.getRole())
                || application.getRecruiterId() == null
                || !application.getRecruiterId().equals(String.valueOf(currentUser.getId()))) {
            throw new com.jobportal.backend.common.exception.ForbiddenException(
                    "Only the job's recruiter can schedule this interview");
        }

        // Validate state transition
        ApplicationStatus current = application.getStatus();
        if (current != null && !current.canTransitionTo(ApplicationStatus.INTERVIEW_SCHEDULED)) {
            throw new BadRequestException("Cannot schedule interview for application in status: " + current);
        }

        // Update application status
        application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        applicationRepository.save(application);

        // Create interview record
        Long candidateId = null;
        try {
            candidateId = Long.parseLong(application.getCandidateId());
        } catch (NumberFormatException ignored) {
        }

        Long jobId = null;
        try {
            jobId = Long.parseLong(application.getJobId());
        } catch (NumberFormatException ignored) {
        }

        Interview interview = Interview.builder()
                .applicationId(applicationId)
                .candidateId(candidateId)
                .recruiterId(recruiterId)
                .jobId(jobId)
                .scheduledAt(scheduledAt)
                .durationMinutes(durationMinutes)
                .type(type)
                .status(InterviewStatus.SCHEDULED)
                .meetingLink(meetingLink)
                .notes(notes)
                .build();

        interview = interviewRepository.save(interview);

        // Create notification
        if (candidateId != null) {
            notificationService.createNotification(
                    candidateId,
                    "seeker",
                    "Interview Scheduled",
                    "Your interview for " + application.getJobTitle() + " at " +
                            application.getCompanyName() + " has been scheduled for " +
                            scheduledAt.toString(),
                    "INTERVIEW");
        }

        auditService.log(AuditAction.INTERVIEW_SCHEDULED, "Interview",
                String.valueOf(interview.getId()),
                "Application: " + applicationId + ", Scheduled: " + scheduledAt);

        logger.info("Interview scheduled for application {} at {}", applicationId, scheduledAt);
        return interview;
    }

    @Transactional
    public Interview updateInterviewStatus(Long interviewId, InterviewStatus newStatus, String feedback) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found: " + interviewId));

        interview.setStatus(newStatus);
        interview.setUpdatedAt(LocalDateTime.now());
        if (feedback != null)
            interview.setFeedback(feedback);

        // If completed, update application status
        if (newStatus == InterviewStatus.COMPLETED) {
            applicationRepository.findById(interview.getApplicationId()).ifPresent(app -> {
                app.setStatus(ApplicationStatus.INTERVIEW_COMPLETED);
                applicationRepository.save(app);
            });
        }

        return interviewRepository.save(interview);
    }

    @Transactional(readOnly = true)
    public List<Interview> getInterviewsByApplication(Long applicationId) {
        return interviewRepository.findByApplicationId(applicationId);
    }

    @Transactional(readOnly = true)
    public List<Interview> getInterviewsByCandidate(Long candidateId) {
        CustomUserDetails currentUser = SecurityUtils.getCurrentUserDetails();
        boolean isAdmin = currentUser != null && "ADMIN".equalsIgnoreCase(currentUser.getRole());
        boolean ownsCandidate = currentUser != null && candidateRepository.findByUserId(currentUser.getId())
                .or(() -> candidateRepository.findByEmail(currentUser.getEmail()))
                .map(candidate -> candidateId.equals(candidate.getId()))
                .orElse(false);
        if (!isAdmin && !ownsCandidate) {
            throw new com.jobportal.backend.common.exception.ForbiddenException(
                    "You can only access your own interviews");
        }
        return interviewRepository.findByCandidateId(candidateId);
    }

    @Transactional(readOnly = true)
    public List<Interview> getInterviewsByRecruiter(Long recruiterId) {
        return interviewRepository.findByRecruiterId(recruiterId);
    }
}

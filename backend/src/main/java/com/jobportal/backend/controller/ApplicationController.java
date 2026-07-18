package com.jobportal.backend.controller;

import com.jobportal.backend.model.Application;
import com.jobportal.backend.model.Job;
import com.jobportal.backend.repository.ApplicationRepository;
import com.jobportal.backend.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @GetMapping
    public ResponseEntity<List<Application>> getApplications(
            @RequestParam(required = false) String candidateId,
            @RequestParam(required = false) String recruiterId,
            @RequestParam(required = false) String recruiterEmail
    ) {
        if (candidateId != null && !candidateId.isEmpty()) {
            return ResponseEntity.ok(applicationRepository.findByCandidateId(candidateId));
        }
        if (recruiterId != null && !recruiterId.isEmpty()) {
            return ResponseEntity.ok(applicationRepository.findByRecruiterId(recruiterId));
        }
        if (recruiterEmail != null && !recruiterEmail.isEmpty()) {
            return ResponseEntity.ok(applicationRepository.findByRecruiterEmail(recruiterEmail));
        }
        return ResponseEntity.ok(applicationRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> applyToJob(@RequestBody Application application) {
        if (application.getJobId() == null || application.getCandidateId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("jobId and candidateId are required");
        }

        // Avoid duplicate applications
        List<Application> candidateApps = applicationRepository.findByCandidateId(application.getCandidateId());
        boolean alreadyApplied = candidateApps.stream()
                .anyMatch(app -> app.getJobId() != null && app.getJobId().equals(application.getJobId()));

        if (alreadyApplied) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Already applied to this job");
        }

        // Auto link recruiterId and recruiterEmail from target Job if missing
        try {
            Long jobIdNum = Long.parseLong(application.getJobId());
            Optional<Job> targetJobOpt = jobRepository.findById(jobIdNum);
            if (targetJobOpt.isPresent()) {
                Job targetJob = targetJobOpt.get();
                if (application.getRecruiterId() == null || application.getRecruiterId().isEmpty()) {
                    application.setRecruiterId(targetJob.getRecruiterId());
                }
                if (application.getRecruiterEmail() == null || application.getRecruiterEmail().isEmpty()) {
                    application.setRecruiterEmail(targetJob.getRecruiterEmail());
                }
                if (application.getCompanyName() == null || application.getCompanyName().isEmpty()) {
                    application.setCompanyName(targetJob.getCompanyName());
                }
                if (application.getJobTitle() == null || application.getJobTitle().isEmpty()) {
                    application.setJobTitle(targetJob.getTitle());
                }
            }
        } catch (NumberFormatException ignored) {}

        if (application.getStatus() == null) {
            application.setStatus("Applied");
        }
        if (application.getAppliedDate() == null) {
            application.setAppliedDate(LocalDate.now().toString());
        }
        if (application.getMatchScore() == 0) {
            application.setMatchScore(85);
        }

        Application savedApp = applicationRepository.save(application);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedApp);
    }
}

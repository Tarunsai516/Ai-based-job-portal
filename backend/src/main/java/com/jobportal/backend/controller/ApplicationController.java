package com.jobportal.backend.controller;

import com.jobportal.backend.dto.ApplicationRequest;
import com.jobportal.backend.dto.ApplicationResponse;
import com.jobportal.backend.repository.CandidateRepository;
import com.jobportal.backend.security.CustomUserDetails;
import com.jobportal.backend.security.SecurityUtils;
import com.jobportal.backend.common.exception.ForbiddenException;
import com.jobportal.backend.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private CandidateRepository candidateRepository;

    @GetMapping
    public ResponseEntity<List<ApplicationResponse>> getApplications(
            @RequestParam(required = false) String candidateId,
            @RequestParam(required = false) String recruiterId,
            @RequestParam(required = false) String recruiterEmail) {
        CustomUserDetails currentUser = requireUser();
        if ("SEEKER".equalsIgnoreCase(currentUser.getRole())) {
            candidateId = String.valueOf(getCurrentCandidateId(currentUser));
        }
        return ResponseEntity.ok(applicationService.getApplications(candidateId, recruiterId, recruiterEmail));
    }

    @PostMapping
    public ResponseEntity<ApplicationResponse> applyToJob(@Valid @RequestBody ApplicationRequest request) {
        CustomUserDetails currentUser = requireUser();
        if ("SEEKER".equalsIgnoreCase(currentUser.getRole())) {
            request.setCandidateId(String.valueOf(getCurrentCandidateId(currentUser)));
            request.setCandidateName(currentUser.getName());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.applyToJob(request));
    }

    private CustomUserDetails requireUser() {
        CustomUserDetails currentUser = SecurityUtils.getCurrentUserDetails();
        if (currentUser == null) {
            throw new ForbiddenException("Authentication is required to access applications");
        }
        return currentUser;
    }

    private Long getCurrentCandidateId(CustomUserDetails currentUser) {
        return candidateRepository.findByUserId(currentUser.getId())
                .or(() -> candidateRepository.findByEmail(currentUser.getEmail()))
                .map(candidate -> candidate.getId())
                .orElseThrow(() -> new ForbiddenException("Candidate profile is not available"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApplicationResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        return ResponseEntity.ok(applicationService.updateApplicationStatus(id, status));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApplicationResponse> updateStatusPut(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        return ResponseEntity.ok(applicationService.updateApplicationStatus(id, status));
    }
}

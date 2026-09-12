package com.jobportal.backend.controller;

import com.jobportal.backend.model.MatchResult;
import com.jobportal.backend.repository.CandidateRepository;
import com.jobportal.backend.security.CustomUserDetails;
import com.jobportal.backend.security.SecurityUtils;
import com.jobportal.backend.common.exception.BadRequestException;
import com.jobportal.backend.common.exception.ForbiddenException;
import com.jobportal.backend.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private CandidateRepository candidateRepository;

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<Page<MatchResult>> getRecommendationsForCandidate(
            @PathVariable Long candidateId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (page < 0 || size < 1 || size > 50) {
            throw new BadRequestException("Page must be non-negative and size must be between 1 and 50");
        }

        CustomUserDetails currentUser = SecurityUtils.getCurrentUserDetails();
        if (currentUser == null) {
            throw new ForbiddenException("Authentication is required to access recommendations");
        }
        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());
        boolean ownsCandidate = candidateRepository.findById(candidateId)
                .map(candidate -> currentUser.getId().equals(candidate.getUserId()))
                .orElse(false);
        if (!isAdmin && !ownsCandidate) {
            throw new ForbiddenException("You can only access your own recommendations");
        }

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(recommendationService.getRecommendationsForCandidate(candidateId, pageable));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<MatchResult>> getRankedCandidatesForJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(recommendationService.getRankedCandidatesForJob(jobId));
    }

    @GetMapping("/candidate/{candidateId}/job/{jobId}")
    public ResponseEntity<MatchResult> getCandidateJobMatch(
            @PathVariable Long candidateId,
            @PathVariable Long jobId) {
        CustomUserDetails currentUser = SecurityUtils.getCurrentUserDetails();
        if (currentUser == null) {
            throw new ForbiddenException("Authentication is required to access match details");
        }
        boolean privileged = "ADMIN".equalsIgnoreCase(currentUser.getRole())
                || "RECRUITER".equalsIgnoreCase(currentUser.getRole());
        boolean ownsCandidate = candidateRepository.findById(candidateId)
                .map(candidate -> currentUser.getId().equals(candidate.getUserId()))
                .orElse(false);
        if (!privileged && !ownsCandidate) {
            throw new ForbiddenException("You can only access your own match details");
        }
        return ResponseEntity.ok(recommendationService.getMatch(candidateId, jobId)
                .orElseGet(() -> recommendationService.calculateMatch(candidateId, jobId)));
    }
}

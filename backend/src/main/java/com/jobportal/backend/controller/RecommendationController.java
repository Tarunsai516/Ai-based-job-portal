package com.jobportal.backend.controller;

import com.jobportal.backend.model.MatchResult;
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

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<Page<MatchResult>> getRecommendationsForCandidate(
            @PathVariable Long candidateId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(recommendationService.getRecommendationsForCandidate(candidateId, pageable));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<MatchResult>> getRankedCandidatesForJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(recommendationService.getRankedCandidatesForJob(jobId));
    }
}

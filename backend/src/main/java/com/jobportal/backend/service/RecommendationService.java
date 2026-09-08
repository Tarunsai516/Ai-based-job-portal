package com.jobportal.backend.service;

import com.jobportal.backend.model.Candidate;
import com.jobportal.backend.model.Job;
import com.jobportal.backend.model.MatchResult;
import com.jobportal.backend.model.enums.JobStatus;
import com.jobportal.backend.repository.CandidateRepository;
import com.jobportal.backend.repository.JobRepository;
import com.jobportal.backend.repository.MatchResultRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * AI-powered job recommendation engine.
 * Ranks active jobs by match score for a given candidate.
 */
@Service
public class RecommendationService {

    private static final Logger logger = LoggerFactory.getLogger(RecommendationService.class);

    @Autowired
    private MatchingService matchingService;

    @Autowired
    private MatchResultRepository matchResultRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    /**
     * Get personalized job recommendations for a candidate, ranked by match score.
     */
    @Transactional
    public Page<MatchResult> getRecommendationsForCandidate(Long candidateId, Pageable pageable) {
        logger.info("Generating recommendations for candidate {}", candidateId);

        // Recalculate every active job so a newly uploaded resume is reflected
        // immediately.
        List<Job> activeJobs = jobRepository.findAll().stream()
                .filter(j -> j.getStatus() == null || j.getStatus() == JobStatus.ACTIVE)
                .toList();

        for (Job job : activeJobs) {
            try {
                matchingService.calculateMatch(candidateId, job.getId());
            } catch (Exception e) {
                logger.warn("Failed to calculate match for candidate {} and job {}: {}",
                        candidateId, job.getId(), e.getMessage());
            }
        }

        // Retrieve all matches sorted by score, excluding closed/expired jobs
        List<MatchResult> allMatches = matchResultRepository
                .findByCandidateIdOrderByOverallScoreDesc(candidateId);

        // Filter out inactive jobs
        Set<Long> activeJobIds = jobRepository.findAll().stream()
                .filter(j -> j.getStatus() == null || j.getStatus() == JobStatus.ACTIVE)
                .map(Job::getId)
                .collect(Collectors.toSet());

        List<MatchResult> activeMatches = allMatches.stream()
                .filter(m -> activeJobIds.contains(m.getJobId()))
                .collect(Collectors.toList());

        // Manual pagination
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), activeMatches.size());
        List<MatchResult> pageContent = start < activeMatches.size()
                ? activeMatches.subList(start, end)
                : List.of();

        return new PageImpl<>(pageContent, pageable, activeMatches.size());
    }

    /**
     * Get ranked candidates for a job (recruiter AI ranking).
     */
    @Transactional
    public List<MatchResult> getRankedCandidatesForJob(Long jobId) {
        logger.info("Ranking candidates for job {}", jobId);

        // Calculate matches for all candidates against this job
        List<Candidate> allCandidates = candidateRepository.findAll();
        List<MatchResult> existingMatches = matchResultRepository
                .findByJobIdOrderByOverallScoreDesc(jobId);

        Set<Long> matchedCandidateIds = existingMatches.stream()
                .map(MatchResult::getCandidateId)
                .collect(Collectors.toSet());

        for (Candidate candidate : allCandidates) {
            if (!matchedCandidateIds.contains(candidate.getId())) {
                try {
                    matchingService.calculateMatch(candidate.getId(), jobId);
                } catch (Exception e) {
                    logger.warn("Failed to match candidate {} with job {}", candidate.getId(), jobId);
                }
            }
        }

        return matchResultRepository.findByJobIdOrderByOverallScoreDesc(jobId);
    }
}

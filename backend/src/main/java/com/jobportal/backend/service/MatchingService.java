package com.jobportal.backend.service;

import com.jobportal.backend.model.*;
import com.jobportal.backend.model.enums.JobStatus;
import com.jobportal.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Hybrid AI Job Matching Engine.
 *
 * Scoring formula:
 * overall = semantic×0.40 + skill×0.30 + experience×0.15 + location×0.10 +
 * education×0.05
 *
 * All weights are configurable via application.properties.
 * All scores are normalized to 0–100.
 */
@Service
public class MatchingService {

    private static final Logger logger = LoggerFactory.getLogger(MatchingService.class);

    @Value("${talentsync.matching.weights.semantic:0.40}")
    private double weightSemantic;

    @Value("${talentsync.matching.weights.skills:0.30}")
    private double weightSkill;

    @Value("${talentsync.matching.weights.experience:0.15}")
    private double weightExperience;

    @Value("${talentsync.matching.weights.location:0.10}")
    private double weightLocation;

    @Value("${talentsync.matching.weights.education:0.05}")
    private double weightEducation;

    @Autowired
    private MatchResultRepository matchResultRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private CandidateSkillRepository candidateSkillRepository;

    @Autowired
    private JobSkillRepository jobSkillRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private SkillService skillService;

    /**
     * Calculate match between a candidate and a job. Stores result in database.
     */
    @Transactional
    public MatchResult calculateMatch(Long candidateId, Long jobId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found: " + candidateId));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));

        // Get candidate skills (from both normalized and legacy string lists)
        Set<String> candidateSkillNames = getCandidateSkillNames(candidate);

        // Get job skills (from both normalized and legacy string lists)
        Set<String> jobSkillNames = getJobSkillNames(job);

        // Get candidate resume text for semantic analysis
        String resumeText = getLatestResumeText(candidateId);

        // 1. Skill Score (30% weight)
        SkillMatchResult skillResult = calculateSkillScore(candidateSkillNames, jobSkillNames);

        // 2. Experience Score (15% weight)
        double experienceScore = calculateExperienceScore(candidate.getExperience(), job.getExperience());

        // 3. Location Score (10% weight)
        double locationScore = calculateLocationScore(candidate.getLocation(), job.getLocation(), job.getType());

        // 4. Education Score (5% weight)
        double educationScore = calculateEducationScore(candidate.getEducation(), job);

        // 5. Semantic Score (40% weight) — keyword overlap between resume and job
        // description
        double semanticScore = calculateSemanticScore(resumeText, job.getDescription(), candidate.getSummary());

        // Weighted overall score
        double overallScore = (semanticScore * weightSemantic)
                + (skillResult.score * weightSkill)
                + (experienceScore * weightExperience)
                + (locationScore * weightLocation)
                + (educationScore * weightEducation);

        overallScore = Math.max(0, Math.min(100, overallScore));

        // Generate explanation
        String explanation = generateExplanation(
                overallScore, semanticScore, skillResult, experienceScore,
                locationScore, educationScore, candidate, job);

        // Persist or update match result
        MatchResult matchResult = matchResultRepository
                .findByCandidateIdAndJobId(candidateId, jobId)
                .orElse(new MatchResult());

        matchResult.setCandidateId(candidateId);
        matchResult.setJobId(jobId);
        matchResult.setOverallScore(Math.round(overallScore * 10.0) / 10.0);
        matchResult.setSemanticScore(Math.round(semanticScore * 10.0) / 10.0);
        matchResult.setSkillScore(Math.round(skillResult.score * 10.0) / 10.0);
        matchResult.setExperienceScore(Math.round(experienceScore * 10.0) / 10.0);
        matchResult.setLocationScore(Math.round(locationScore * 10.0) / 10.0);
        matchResult.setEducationScore(Math.round(educationScore * 10.0) / 10.0);
        matchResult.setMatchedSkills(new ArrayList<>(skillResult.matched));
        matchResult.setMissingSkills(new ArrayList<>(skillResult.missing));
        matchResult.setExplanation(explanation);
        matchResult.setCalculatedAt(LocalDateTime.now());

        logger.info("Match calculated: candidate={}, job={}, score={}", candidateId, jobId,
                matchResult.getOverallScore());

        return matchResultRepository.save(matchResult);
    }

    /**
     * Calculate matches for a candidate against all active jobs.
     */
    @Transactional
    public List<MatchResult> calculateMatchesForCandidate(Long candidateId) {
        List<Job> activeJobs = jobRepository.findAll().stream()
                .filter(j -> j.getStatus() == null || j.getStatus() == JobStatus.ACTIVE)
                .toList();

        return activeJobs.stream()
                .map(job -> {
                    try {
                        return calculateMatch(candidateId, job.getId());
                    } catch (Exception e) {
                        logger.warn("Failed to match candidate {} with job {}: {}", candidateId, job.getId(),
                                e.getMessage());
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingDouble(MatchResult::getOverallScore).reversed())
                .collect(Collectors.toList());
    }

    /**
     * Calculate matches for a job against all candidates (for recruiter ranking).
     */
    @Transactional
    public List<MatchResult> calculateMatchesForJob(Long jobId) {
        List<Candidate> candidates = candidateRepository.findAll();

        return candidates.stream()
                .map(c -> {
                    try {
                        return calculateMatch(c.getId(), jobId);
                    } catch (Exception e) {
                        logger.warn("Failed to match candidate {} with job {}: {}", c.getId(), jobId, e.getMessage());
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingDouble(MatchResult::getOverallScore).reversed())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<MatchResult> getMatch(Long candidateId, Long jobId) {
        return matchResultRepository.findByCandidateIdAndJobId(candidateId, jobId);
    }

    @Transactional(readOnly = true)
    public List<MatchResult> getCandidateMatches(Long candidateId) {
        return matchResultRepository.findByCandidateIdOrderByOverallScoreDesc(candidateId);
    }

    @Transactional(readOnly = true)
    public List<MatchResult> getJobMatches(Long jobId) {
        return matchResultRepository.findByJobIdOrderByOverallScoreDesc(jobId);
    }

    // ========== SCORING ALGORITHMS ==========

    private Set<String> getCandidateSkillNames(Candidate candidate) {
        Set<String> skills = new HashSet<>();
        // From legacy string list
        if (candidate.getSkills() != null) {
            candidate.getSkills().forEach(s -> skills.add(skillService.normalize(s)));
        }
        // From normalized CandidateSkill table
        candidateSkillRepository.findByCandidateId(candidate.getId())
                .forEach(cs -> skills.add(cs.getSkill().getNormalizedName()));
        return skills;
    }

    private Set<String> getJobSkillNames(Job job) {
        Set<String> skills = new HashSet<>();
        if (job.getSkills() != null) {
            job.getSkills().forEach(s -> skills.add(skillService.normalize(s)));
        }
        jobSkillRepository.findByJobId(job.getId())
                .forEach(js -> skills.add(js.getSkill().getNormalizedName()));
        return skills;
    }

    private String getLatestResumeText(Long candidateId) {
        return resumeRepository.findTopByCandidateIdOrderByCreatedAtDesc(candidateId)
                .map(Resume::getRawText)
                .orElse("");
    }

    /**
     * Skill overlap scoring using Jaccard-like similarity.
     */
    static SkillMatchResult calculateSkillScore(Set<String> candidateSkills, Set<String> jobSkills) {
        if (jobSkills.isEmpty()) {
            return new SkillMatchResult(50.0, Set.of(), Set.of()); // no requirements → neutral
        }

        Set<String> matched = new HashSet<>(candidateSkills);
        matched.retainAll(jobSkills);

        Set<String> missing = new HashSet<>(jobSkills);
        missing.removeAll(candidateSkills);

        double score = (matched.size() * 100.0) / jobSkills.size();
        return new SkillMatchResult(score, matched, missing);
    }

    record SkillMatchResult(double score, Set<String> matched, Set<String> missing) {
    }

    /**
     * Experience scoring: compares candidate years to job requirement.
     */
    static double calculateExperienceScore(String candidateExp, String jobExp) {
        double candidateYears = parseYears(candidateExp);
        double requiredYears = parseYears(jobExp);

        if (requiredYears <= 0)
            return 70; // No requirement
        if (candidateYears <= 0)
            return 30; // No data

        double ratio = candidateYears / requiredYears;
        if (ratio >= 1.5)
            return 100; // Exceeds requirement significantly
        if (ratio >= 1.0)
            return 90 + (ratio - 1.0) * 20; // Meets or slightly exceeds
        if (ratio >= 0.7)
            return 60 + (ratio - 0.7) * 100; // Close
        if (ratio >= 0.5)
            return 40 + (ratio - 0.5) * 100; // Somewhat close
        return 20 + ratio * 40; // Below requirement
    }

    /**
     * Location scoring: checks match between candidate and job location.
     */
    static double calculateLocationScore(String candidateLocation, String jobLocation, String workType) {
        // Remote jobs always score 100
        if (workType != null && workType.toLowerCase().contains("remote"))
            return 100;

        if (candidateLocation == null || candidateLocation.isEmpty() ||
                jobLocation == null || jobLocation.isEmpty())
            return 50; // Unknown

        String candLoc = candidateLocation.toLowerCase().trim();
        String jobLoc = jobLocation.toLowerCase().trim();

        if (candLoc.equals(jobLoc))
            return 100;

        // Check city or state overlap
        Set<String> candTokens = new HashSet<>(Arrays.asList(candLoc.split("[,\\s]+")));
        Set<String> jobTokens = new HashSet<>(Arrays.asList(jobLoc.split("[,\\s]+")));
        candTokens.remove("");
        jobTokens.remove("");

        Set<String> overlap = new HashSet<>(candTokens);
        overlap.retainAll(jobTokens);

        if (!overlap.isEmpty())
            return 70 + (overlap.size() * 10.0);

        if (workType != null && workType.toLowerCase().contains("hybrid"))
            return 60;

        return 30; // Different location, onsite
    }

    /**
     * Education scoring: basic heuristic.
     */
    static double calculateEducationScore(String candidateEducation, Job job) {
        if (candidateEducation == null || candidateEducation.isEmpty())
            return 40;

        String eduLower = candidateEducation.toLowerCase();
        double score = 50;

        if (eduLower.contains("ph.d") || eduLower.contains("phd") || eduLower.contains("doctorate"))
            score = 100;
        else if (eduLower.contains("master") || eduLower.contains("m.s") || eduLower.contains("mba"))
            score = 85;
        else if (eduLower.contains("bachelor") || eduLower.contains("b.s") || eduLower.contains("b.tech") ||
                eduLower.contains("b.e"))
            score = 70;
        else if (eduLower.contains("associate") || eduLower.contains("diploma"))
            score = 55;

        // Bonus for CS/IT related
        if (eduLower.contains("computer") || eduLower.contains("software") || eduLower.contains("information") ||
                eduLower.contains("engineering") || eduLower.contains("technology")) {
            score = Math.min(100, score + 10);
        }

        return score;
    }

    /**
     * Semantic similarity using keyword overlap (TF-IDF-like).
     * Serves as a proxy until real embeddings are available.
     */
    static double calculateSemanticScore(String resumeText, String jobDescription, String candidateSummary) {
        String combined = (resumeText != null ? resumeText : "") + " " +
                (candidateSummary != null ? candidateSummary : "");

        if (combined.isBlank() || jobDescription == null || jobDescription.isBlank())
            return 40;

        Set<String> resumeTokens = tokenize(combined);
        Set<String> jobTokens = tokenize(jobDescription);

        if (jobTokens.isEmpty())
            return 50;

        // Remove common stop words
        Set<String> stopWords = Set.of("the", "a", "an", "is", "are", "was", "were", "be", "been",
                "being", "have", "has", "had", "do", "does", "did", "will", "would", "could",
                "should", "may", "might", "shall", "can", "to", "of", "in", "for", "on", "with",
                "at", "by", "from", "as", "into", "through", "and", "or", "but", "not", "this",
                "that", "these", "those", "it", "its", "we", "our", "you", "your", "they", "their");
        resumeTokens.removeAll(stopWords);
        jobTokens.removeAll(stopWords);

        if (jobTokens.isEmpty())
            return 50;

        Set<String> overlap = new HashSet<>(resumeTokens);
        overlap.retainAll(jobTokens);

        // Jaccard similarity on meaningful tokens
        Set<String> union = new HashSet<>(resumeTokens);
        union.addAll(jobTokens);

        double jaccard = union.isEmpty() ? 0 : (double) overlap.size() / union.size();
        // Coverage: how many job keywords are in the resume
        double coverage = (double) overlap.size() / jobTokens.size();

        // Weighted combination: coverage matters more than pure Jaccard
        return Math.min(100, (coverage * 70 + jaccard * 30) * 100);
    }

    private static Set<String> tokenize(String text) {
        return Arrays.stream(text.toLowerCase().replaceAll("[^a-z0-9+#.\\s]", " ").split("\\s+"))
                .filter(t -> t.length() >= 2)
                .collect(Collectors.toSet());
    }

    static double parseYears(String experience) {
        if (experience == null || experience.isEmpty())
            return 0;
        Pattern p = Pattern.compile("(\\d+(?:\\.\\d+)?)");
        Matcher m = p.matcher(experience);
        double maxYears = 0;
        while (m.find()) {
            maxYears = Math.max(maxYears, Double.parseDouble(m.group(1)));
        }
        return maxYears;
    }

    private String generateExplanation(double overall, double semantic, SkillMatchResult skillResult,
            double experience, double location, double education,
            Candidate candidate, Job job) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("MATCH SCORE: %.0f%%\n\n", overall));

        sb.append("COMPONENT SCORES:\n");
        sb.append(String.format("  Semantic Similarity: %.0f/100 (weight: %.0f%%)\n", semantic, weightSemantic * 100));
        sb.append(String.format("  Skill Match: %.0f/100 (weight: %.0f%%)\n", skillResult.score, weightSkill * 100));
        sb.append(String.format("  Experience: %.0f/100 (weight: %.0f%%)\n", experience, weightExperience * 100));
        sb.append(String.format("  Location: %.0f/100 (weight: %.0f%%)\n", location, weightLocation * 100));
        sb.append(String.format("  Education: %.0f/100 (weight: %.0f%%)\n\n", education, weightEducation * 100));

        if (!skillResult.matched.isEmpty()) {
            sb.append("MATCHED SKILLS:\n");
            skillResult.matched.forEach(s -> sb.append("  ✓ ").append(s).append("\n"));
            sb.append("\n");
        }

        if (!skillResult.missing.isEmpty()) {
            sb.append("MISSING SKILLS:\n");
            skillResult.missing.forEach(s -> sb.append("  ✗ ").append(s).append("\n"));
            sb.append("\n");
        }

        if (candidate.getExperience() != null) {
            sb.append("EXPERIENCE:\n");
            sb.append("  Candidate: ").append(candidate.getExperience()).append("\n");
            if (job.getExperience() != null) {
                sb.append("  Required: ").append(job.getExperience()).append("\n");
            }
        }

        return sb.toString();
    }
}

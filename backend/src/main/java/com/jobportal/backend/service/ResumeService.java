package com.jobportal.backend.service;

import com.jobportal.backend.common.exception.BadRequestException;
import com.jobportal.backend.common.exception.ResourceNotFoundException;
import com.jobportal.backend.model.*;
import com.jobportal.backend.model.enums.AuditAction;
import com.jobportal.backend.model.enums.ResumeStatus;
import com.jobportal.backend.repository.CandidateRepository;
import com.jobportal.backend.repository.CandidateSkillRepository;
import com.jobportal.backend.repository.ResumeRepository;
import com.jobportal.backend.repository.JobRepository;
import com.jobportal.backend.service.ai.AiProvider;
import com.jobportal.backend.service.ai.AiResumeAnalysisResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.tika.Tika;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Collections;
import java.util.UUID;

/**
 * Service for resume upload, text extraction (Apache Tika), and AI analysis.
 * Processing is asynchronous — upload returns immediately, analysis happens in
 * background.
 */
@Service
public class ResumeService {

    private static final Logger logger = LoggerFactory.getLogger(ResumeService.class);
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final List<String> ALLOWED_EXTENSIONS = List.of(".pdf", ".docx", ".doc");
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword");

    @Value("${talentsync.resume.upload-dir:./uploads/resumes}")
    private String uploadDir;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private CandidateSkillRepository candidateSkillRepository;

    @Autowired
    private SkillService skillService;

    @Autowired
    private AiProvider aiProvider;

    @Autowired
    private AuditService auditService;

    @Autowired
    private ObjectMapper objectMapper;

    private final Tika tika = new Tika();

    /**
     * Upload and store a resume file. Returns the Resume entity immediately.
     * Actual processing is done asynchronously.
     */
    @Transactional
    public Resume uploadResume(MultipartFile file, Long candidateId, Long userId) {
        validateFile(file);

        String originalFilename = file.getOriginalFilename();
        String storedFilename = UUID.randomUUID() + getExtension(originalFilename);
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath();

        try {
            Files.createDirectories(uploadPath);
            Path filePath = uploadPath.resolve(storedFilename);
            file.transferTo(filePath.toFile());

            Resume resume = Resume.builder()
                    .candidateId(candidateId)
                    .userId(userId)
                    .originalFileName(originalFilename)
                    .storedFileName(storedFilename)
                    .storedPath(filePath.toString())
                    .contentType(file.getContentType())
                    .fileSize(file.getSize())
                    .status(ResumeStatus.UPLOADED)
                    .build();

            resume = resumeRepository.save(resume);

            auditService.log(AuditAction.RESUME_UPLOADED, "Resume", String.valueOf(resume.getId()),
                    "File: " + originalFilename);

            // Trigger async processing
            processResumeAsync(resume.getId());

            return resume;
        } catch (IOException e) {
            logger.error("Failed to store resume file: {}", e.getMessage());
            throw new BadRequestException("Failed to upload resume: " + e.getMessage());
        }
    }

    /**
     * Asynchronous resume processing pipeline:
     * 1. Extract text using Apache Tika
     * 2. AI analysis (skill extraction, structured data)
     * 3. Map skills to normalized Skill entities
     * 4. Update candidate profile
     */
    @Async
    @Transactional
    public void processResumeAsync(Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found: " + resumeId));

        resume.setStatus(ResumeStatus.PROCESSING);
        resumeRepository.save(resume);

        try {
            // Step 1: Extract text with Apache Tika
            String extractedText = extractText(resume.getStoredPath());
            resume.setRawText(extractedText);

            if (extractedText == null || extractedText.isBlank()) {
                throw new RuntimeException("No text could be extracted from the document");
            }

            logger.info("Extracted {} characters from resume {}", extractedText.length(), resumeId);

            // Step 2: AI Analysis
            AiResumeAnalysisResult analysis = aiProvider.analyzeResume(extractedText);
            resume.setParsedDataJson(objectMapper.writeValueAsString(analysis));

            // Step 3: Map skills to normalized Skill entities
            if (analysis.getSkills() != null && !analysis.getSkills().isEmpty()) {
                mapCandidateSkills(resume.getCandidateId(), analysis.getSkills());
            }

            // Step 4: Update candidate profile with extracted data
            updateCandidateFromAnalysis(resume.getCandidateId(), analysis);

            resume.setStatus(ResumeStatus.COMPLETED);
            resume.setProcessedAt(LocalDateTime.now());

            auditService.log(AuditAction.RESUME_ANALYZED, "Resume", String.valueOf(resumeId),
                    "Skills found: " + (analysis.getSkills() != null ? analysis.getSkills().size() : 0));

            logger.info("Resume {} processed successfully using {}", resumeId, aiProvider.getProviderName());

        } catch (Exception e) {
            logger.error("Resume processing failed for {}: {}", resumeId, e.getMessage());
            resume.setStatus(ResumeStatus.FAILED);
            resume.setErrorMessage(e.getMessage());
        }

        resumeRepository.save(resume);
    }

    @Transactional(readOnly = true)
    public Resume getResume(Long resumeId) {
        return resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found: " + resumeId));
    }

    @Transactional(readOnly = true)
    public Resume getResumeForUser(Long resumeId, Long userId) {
        Resume resume = getResume(resumeId);
        if (resume.getUserId() == null || !resume.getUserId().equals(userId)) {
            throw new com.jobportal.backend.common.exception.ForbiddenException("You cannot access this resume");
        }
        return resume;
    }

    @Transactional(readOnly = true)
    public Resource getFileForUser(Long resumeId, Long userId) {
        Resume resume = getResumeForUser(resumeId, userId);
        try {
            Resource resource = new UrlResource(Paths.get(resume.getStoredPath()).toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("Resume file is not available");
            }
            return resource;
        } catch (IOException e) {
            throw new ResourceNotFoundException("Resume file is not available");
        }
    }

    @Transactional(readOnly = true)
    public List<Resume> getResumesByCandidate(Long candidateId) {
        return resumeRepository.findByCandidateId(candidateId);
    }

    @Transactional(readOnly = true)
    public Resume getLatestResume(Long candidateId) {
        return resumeRepository.findTopByCandidateIdOrderByCreatedAtDesc(candidateId)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public Resume getLatestResumeForUser(Long userId) {
        return resumeRepository.findByUserId(userId).stream()
                .max(java.util.Comparator.comparing(Resume::getCreatedAt))
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getResumeSummariesForUser(Long userId) {
        return resumeRepository.findByUserId(userId).stream().map(resume -> {
            java.util.Map<String, Object> summary = new java.util.LinkedHashMap<>();
            summary.put("resumeId", resume.getId());
            summary.put("filename", resume.getOriginalFileName());
            summary.put("status", resume.getStatus().name());
            summary.put("fileSize", resume.getFileSize());
            summary.put("createdAt", resume.getCreatedAt());
            summary.put("processedAt", resume.getProcessedAt());
            summary.put("errorMessage", resume.getErrorMessage());
            return summary;
        }).toList();
    }

    @Transactional(readOnly = true)
    public com.jobportal.backend.service.ai.ResumeCoachResult reviewResumeForJob(Long resumeId, Long jobId,
            Long userId) {
        Resume resume = getResumeForUser(resumeId, userId);
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));
        if (resume.getRawText() == null || resume.getRawText().isBlank()) {
            throw new BadRequestException("This resume is still processing");
        }
        String jobText = String.join("\n", java.util.List.of(
                job.getTitle(), job.getDescription(),
                String.join(" ", job.getSkills() == null ? java.util.List.of() : job.getSkills()),
                String.join(" ", job.getQualifications() == null ? java.util.List.of() : job.getQualifications())));
        return aiProvider.coachResume(resume.getRawText(), jobText,
                java.util.Collections.emptyList(), job.getSkills());
    }

    @Transactional(readOnly = true)
    public com.jobportal.backend.service.ai.ResumeCoachResult reviewLatestResume(Long userId) {
        Resume resume = getLatestResumeForUser(userId);
        if (resume == null || resume.getRawText() == null || resume.getRawText().isBlank()) {
            throw new BadRequestException("Upload and process a resume before requesting an AI review");
        }

        List<String> skills = candidateRepository.findByUserId(userId)
                .map(Candidate::getSkills)
                .orElse(Collections.emptyList());
        return aiProvider.coachResume(resume.getRawText(), "", skills, Collections.emptyList());
    }

    /**
     * Retry processing for a failed resume.
     */
    @Transactional
    public void retryProcessing(Long resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found: " + resumeId));

        if (resume.getStatus() != ResumeStatus.FAILED) {
            throw new BadRequestException("Only FAILED resumes can be retried");
        }

        resume.setErrorMessage(null);
        resumeRepository.save(resume);
        processResumeAsync(resumeId);
    }

    // ---- Private Helpers ----

    private String extractText(String filePath) {
        try (InputStream is = Files.newInputStream(Paths.get(filePath))) {
            return tika.parseToString(is);
        } catch (Exception e) {
            logger.error("Tika text extraction failed for {}: {}", filePath, e.getMessage());
            throw new RuntimeException("Text extraction failed: " + e.getMessage());
        }
    }

    @Transactional
    void mapCandidateSkills(Long candidateId, List<String> skillNames) {
        List<Skill> skills = skillService.findOrCreateAll(skillNames);
        // Don't delete existing skills, merge
        List<CandidateSkill> existing = candidateSkillRepository.findByCandidateId(candidateId);
        var existingSkillIds = existing.stream()
                .map(cs -> cs.getSkill().getId())
                .collect(java.util.stream.Collectors.toSet());

        for (Skill skill : skills) {
            if (!existingSkillIds.contains(skill.getId())) {
                candidateSkillRepository.save(CandidateSkill.builder()
                        .candidateId(candidateId)
                        .skill(skill)
                        .build());
            }
        }
    }

    private void updateCandidateFromAnalysis(Long candidateId, AiResumeAnalysisResult analysis) {
        candidateRepository.findById(candidateId).ifPresent(candidate -> {
            if (analysis.getName() != null && (candidate.getName() == null || candidate.getName().isEmpty())) {
                candidate.setName(analysis.getName());
            }
            if (analysis.getEmail() != null && (candidate.getEmail() == null || candidate.getEmail().isEmpty())) {
                candidate.setEmail(analysis.getEmail());
            }
            if (analysis.getPhone() != null && (candidate.getPhone() == null || candidate.getPhone().isEmpty())) {
                candidate.setPhone(analysis.getPhone());
            }
            if (analysis.getSkills() != null && !analysis.getSkills().isEmpty()) {
                candidate.setSkills(analysis.getSkills());
            }
            if (analysis.getEstimatedYearsOfExperience() > 0 &&
                    (candidate.getExperience() == null || candidate.getExperience().isEmpty())) {
                candidate.setExperience(String.format("%.0f years", analysis.getEstimatedYearsOfExperience()));
            }
            if (analysis.getEducation() != null && !analysis.getEducation().isEmpty() &&
                    (candidate.getEducation() == null || candidate.getEducation().isEmpty())) {
                candidate.setEducation(analysis.getEducation().get(0).getDegree());
            }
            if (analysis.getSummary() != null && (candidate.getSummary() == null || candidate.getSummary().isEmpty())) {
                candidate.setSummary(analysis.getSummary());
            }
            candidateRepository.save(candidate);
        });
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds maximum of 10MB");
        }
        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new BadRequestException("Filename is required");
        }
        String ext = getExtension(filename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new BadRequestException("Invalid file format. Allowed: PDF, DOCX");
        }
        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            logger.warn("Unexpected content type: {} for file: {}", contentType, filename);
        }
    }

    private String getExtension(String filename) {
        if (filename == null)
            return "";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : "";
    }
}

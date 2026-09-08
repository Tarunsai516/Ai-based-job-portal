package com.jobportal.backend.service;

import com.jobportal.backend.common.exception.BadRequestException;
import com.jobportal.backend.common.exception.ForbiddenException;
import com.jobportal.backend.common.exception.ResourceNotFoundException;
import com.jobportal.backend.dto.CandidateDto;
import com.jobportal.backend.model.Candidate;
import com.jobportal.backend.model.Resume;
import com.jobportal.backend.repository.CandidateRepository;
import com.jobportal.backend.security.CustomUserDetails;
import com.jobportal.backend.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CandidateService {

    private static final Logger logger = LoggerFactory.getLogger(CandidateService.class);

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private ResumeService resumeService;

    @Transactional(readOnly = true)
    public List<CandidateDto> getAllCandidates() {
        return candidateRepository.findAll().stream()
                .map(CandidateDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get current user's candidate profile (user-aware, not hardcoded to ID=1).
     */
    @Transactional
    public CandidateDto getMyProfile() {
        CustomUserDetails currentUser = SecurityUtils.getCurrentUserDetails();

        if (currentUser != null) {
            // Try finding by userId first
            Optional<Candidate> byUser = candidateRepository.findByUserId(currentUser.getId());
            if (byUser.isPresent())
                return CandidateDto.fromEntity(byUser.get());

            // Try finding by email
            Optional<Candidate> byEmail = candidateRepository.findByEmail(currentUser.getEmail());
            if (byEmail.isPresent()) {
                // Link the candidate to the user
                Candidate c = byEmail.get();
                c.setUserId(currentUser.getId());
                candidateRepository.save(c);
                return CandidateDto.fromEntity(c);
            }

            // Auto-create a candidate profile for this user
            Candidate newCandidate = Candidate.builder()
                    .userId(currentUser.getId())
                    .name(currentUser.getName())
                    .email(currentUser.getEmail())
                    .build();
            candidateRepository.save(newCandidate);
            return CandidateDto.fromEntity(newCandidate);
        }

        throw new ForbiddenException("Authentication is required to access a candidate profile");
    }

    @Transactional(readOnly = true)
    public CandidateDto getCandidateById(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found with ID: " + id));
        return CandidateDto.fromEntity(candidate);
    }

    @Transactional
    public CandidateDto updateProfile(CandidateDto dto) {
        logger.info("Updating candidate profile");

        // Find the candidate for the current user
        CustomUserDetails currentUser = SecurityUtils.getCurrentUserDetails();
        Candidate candidate = null;

        if (currentUser != null) {
            candidate = candidateRepository.findByUserId(currentUser.getId()).orElse(null);
            if (candidate == null) {
                candidate = candidateRepository.findByEmail(currentUser.getEmail()).orElse(null);
            }
        }

        if (candidate == null) {
            throw new ForbiddenException("Authentication is required to update a candidate profile");
        }

        if (dto.getName() != null)
            candidate.setName(dto.getName());
        if (dto.getTitle() != null)
            candidate.setTitle(dto.getTitle());
        if (dto.getLocation() != null)
            candidate.setLocation(dto.getLocation());
        if (dto.getEmail() != null)
            candidate.setEmail(dto.getEmail());
        if (dto.getPhone() != null)
            candidate.setPhone(dto.getPhone());
        if (dto.getSummary() != null)
            candidate.setSummary(dto.getSummary());
        if (dto.getSkills() != null)
            candidate.setSkills(dto.getSkills());
        if (dto.getMissingSkills() != null)
            candidate.setMissingSkills(dto.getMissingSkills());
        if (dto.getExperience() != null)
            candidate.setExperience(dto.getExperience());
        if (dto.getEducation() != null)
            candidate.setEducation(dto.getEducation());

        if (currentUser != null && candidate.getUserId() == null) {
            candidate.setUserId(currentUser.getId());
        }

        Candidate saved = candidateRepository.save(candidate);
        return CandidateDto.fromEntity(saved);
    }

    /**
     * Upload and process resume using the ResumeService pipeline.
     * Returns processing status and resume info — no more fake hardcoded results.
     */
    @Transactional
    public Map<String, Object> uploadResume(MultipartFile file) {
        CustomUserDetails currentUser = SecurityUtils.getCurrentUserDetails();
        Long userId = currentUser != null ? currentUser.getId() : null;

        // Find or create candidate
        Candidate candidate = null;
        if (currentUser != null) {
            candidate = candidateRepository.findByUserId(currentUser.getId()).orElse(null);
            if (candidate == null) {
                candidate = candidateRepository.findByEmail(currentUser.getEmail()).orElse(null);
            }
            if (candidate == null) {
                candidate = Candidate.builder()
                        .userId(currentUser.getId())
                        .name(currentUser.getName())
                        .email(currentUser.getEmail())
                        .build();
                candidate = candidateRepository.save(candidate);
            }
        } else {
            throw new ForbiddenException("Authentication is required to upload a resume");
        }

        // Upload and trigger async processing
        Resume resume = resumeService.uploadResume(file, candidate.getId(), userId);

        // Update candidate's resume URL
        candidate.setResumeUrl(resume.getOriginalFileName());
        candidateRepository.save(candidate);

        return Map.of(
                "resumeId", resume.getId(),
                "candidateId", candidate.getId(),
                "filename", resume.getOriginalFileName(),
                "size", (double) resume.getFileSize() / 1024 / 1024,
                "status", resume.getStatus().name(),
                "message", "Resume uploaded successfully. Processing in background.");
    }
}

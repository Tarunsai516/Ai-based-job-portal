package com.jobportal.backend.service;

import com.jobportal.backend.common.exception.BadRequestException;
import com.jobportal.backend.common.exception.ResourceNotFoundException;
import com.jobportal.backend.dto.CandidateDto;
import com.jobportal.backend.model.Candidate;
import com.jobportal.backend.repository.CandidateRepository;
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

    @Transactional(readOnly = true)
    public List<CandidateDto> getAllCandidates() {
        return candidateRepository.findAll().stream()
                .map(CandidateDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CandidateDto getMyProfile() {
        Optional<Candidate> candidateOpt = candidateRepository.findById(1L);
        if (candidateOpt.isEmpty()) {
            List<Candidate> all = candidateRepository.findAll();
            if (!all.isEmpty()) {
                return CandidateDto.fromEntity(all.get(0));
            }
            throw new ResourceNotFoundException("Candidate profile not found");
        }
        return CandidateDto.fromEntity(candidateOpt.get());
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
        Optional<Candidate> candidateOpt = candidateRepository.findById(1L);
        Candidate candidate = candidateOpt.orElseGet(Candidate::new);

        if (dto.getName() != null) candidate.setName(dto.getName());
        if (dto.getTitle() != null) candidate.setTitle(dto.getTitle());
        if (dto.getLocation() != null) candidate.setLocation(dto.getLocation());
        if (dto.getEmail() != null) candidate.setEmail(dto.getEmail());
        if (dto.getPhone() != null) candidate.setPhone(dto.getPhone());
        if (dto.getSummary() != null) candidate.setSummary(dto.getSummary());
        if (dto.getSkills() != null) candidate.setSkills(dto.getSkills());
        if (dto.getMissingSkills() != null) candidate.setMissingSkills(dto.getMissingSkills());
        if (dto.getExperience() != null) candidate.setExperience(dto.getExperience());
        if (dto.getEducation() != null) candidate.setEducation(dto.getEducation());

        Candidate saved = candidateRepository.save(candidate);
        return CandidateDto.fromEntity(saved);
    }

    @Transactional
    public Map<String, Object> uploadResume(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.endsWith(".pdf") && !filename.endsWith(".docx"))) {
            throw new BadRequestException("Invalid file format. PDF or DOCX only.");
        }

        logger.info("Processing resume upload: {}", filename);

        Map<String, Object> mockParsedResult = Map.of(
            "filename", filename,
            "size", (double) file.getSize() / 1024 / 1024,
            "experience", "5.5 Years",
            "compatibilityScore", 92,
            "matchScore", 92,
            "skills", List.of("React", "JavaScript", "Tailwind CSS", "Next.js", "Redux", "Git"),
            "suggestedRoles", List.of("Senior React Developer", "Frontend Engineer", "UI/UX Developer"),
            "resumeUrl", filename
        );

        candidateRepository.findById(1L).ifPresent(c -> {
            c.setResumeUrl(filename);
            candidateRepository.save(c);
        });

        return mockParsedResult;
    }
}

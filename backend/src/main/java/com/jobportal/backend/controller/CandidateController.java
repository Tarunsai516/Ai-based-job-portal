package com.jobportal.backend.controller;

import com.jobportal.backend.model.Candidate;
import com.jobportal.backend.repository.CandidateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    @Autowired
    private CandidateRepository candidateRepository;

    @GetMapping
    public ResponseEntity<List<Candidate>> getAllCandidates() {
        return ResponseEntity.ok(candidateRepository.findAll());
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {
        Optional<Candidate> candidateOpt = candidateRepository.findById(1L);
        if (candidateOpt.isEmpty()) {
            List<Candidate> all = candidateRepository.findAll();
            if (!all.isEmpty()) {
                return ResponseEntity.ok(all.get(0));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Candidate profile not found");
        }
        return ResponseEntity.ok(candidateOpt.get());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCandidateById(@PathVariable Long id) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Candidate not found");
        }
        return ResponseEntity.ok(candidateOpt.get());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateCandidateProfile(@RequestBody Candidate updatedCandidate) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(1L);
        Candidate candidate;
        if (candidateOpt.isPresent()) {
            candidate = candidateOpt.get();
        } else {
            candidate = new Candidate();
        }

        if (updatedCandidate.getName() != null) candidate.setName(updatedCandidate.getName());
        if (updatedCandidate.getTitle() != null) candidate.setTitle(updatedCandidate.getTitle());
        if (updatedCandidate.getLocation() != null) candidate.setLocation(updatedCandidate.getLocation());
        if (updatedCandidate.getEmail() != null) candidate.setEmail(updatedCandidate.getEmail());
        if (updatedCandidate.getPhone() != null) candidate.setPhone(updatedCandidate.getPhone());
        if (updatedCandidate.getSummary() != null) candidate.setSummary(updatedCandidate.getSummary());
        if (updatedCandidate.getSkills() != null) candidate.setSkills(updatedCandidate.getSkills());
        if (updatedCandidate.getMissingSkills() != null) candidate.setMissingSkills(updatedCandidate.getMissingSkills());
        if (updatedCandidate.getExperience() != null) candidate.setExperience(updatedCandidate.getExperience());
        if (updatedCandidate.getEducation() != null) candidate.setEducation(updatedCandidate.getEducation());

        Candidate saved = candidateRepository.save(candidate);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/resume/upload")
    public ResponseEntity<?> uploadResume(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("File is empty");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.endsWith(".pdf") && !filename.endsWith(".docx"))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid format. PDF or DOCX only.");
        }

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

        // Update candidate resumeUrl on file upload
        candidateRepository.findById(1L).ifPresent(c -> {
            c.setResumeUrl(filename);
            candidateRepository.save(c);
        });

        return ResponseEntity.ok(mockParsedResult);
    }
}

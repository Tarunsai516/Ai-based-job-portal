package com.jobportal.backend.controller;

import com.jobportal.backend.dto.CandidateDto;
import com.jobportal.backend.service.CandidateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    @Autowired
    private CandidateService candidateService;

    @GetMapping
    public ResponseEntity<List<CandidateDto>> getAllCandidates() {
        return ResponseEntity.ok(candidateService.getAllCandidates());
    }

    @GetMapping("/me")
    public ResponseEntity<CandidateDto> getMyProfile() {
        return ResponseEntity.ok(candidateService.getMyProfile());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CandidateDto> getCandidateById(@PathVariable Long id) {
        return ResponseEntity.ok(candidateService.getCandidateById(id));
    }

    @PutMapping("/profile")
    public ResponseEntity<CandidateDto> updateCandidateProfile(@RequestBody CandidateDto candidateDto) {
        return ResponseEntity.ok(candidateService.updateProfile(candidateDto));
    }

    @PostMapping("/resume/upload")
    public ResponseEntity<Map<String, Object>> uploadResume(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(candidateService.uploadResume(file));
    }
}

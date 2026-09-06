package com.jobportal.backend.controller;

import com.jobportal.backend.dto.ApplicationRequest;
import com.jobportal.backend.dto.ApplicationResponse;
import com.jobportal.backend.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @GetMapping
    public ResponseEntity<List<ApplicationResponse>> getApplications(
            @RequestParam(required = false) String candidateId,
            @RequestParam(required = false) String recruiterId,
            @RequestParam(required = false) String recruiterEmail
    ) {
        return ResponseEntity.ok(applicationService.getApplications(candidateId, recruiterId, recruiterEmail));
    }

    @PostMapping
    public ResponseEntity<ApplicationResponse> applyToJob(@Valid @RequestBody ApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.applyToJob(request));
    }
}

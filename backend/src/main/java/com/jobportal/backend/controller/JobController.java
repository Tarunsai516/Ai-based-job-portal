package com.jobportal.backend.controller;

import com.jobportal.backend.dto.JobRequest;
import com.jobportal.backend.dto.JobResponse;
import com.jobportal.backend.service.JobService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    @GetMapping
    public ResponseEntity<List<JobResponse>> getAllJobs(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String recruiterId,
            @RequestParam(required = false) String recruiterEmail
    ) {
        return ResponseEntity.ok(jobService.getAllJobs(q, location, type, recruiterId, recruiterEmail));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @PostMapping
    public ResponseEntity<JobResponse> createJob(@Valid @RequestBody JobRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.createJob(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobResponse> updateJob(@PathVariable Long id, @RequestBody JobRequest request) {
        return ResponseEntity.ok(jobService.updateJob(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok(Map.of("message", "Job deleted successfully"));
    }
}

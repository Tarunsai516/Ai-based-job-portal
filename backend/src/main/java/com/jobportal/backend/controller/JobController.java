package com.jobportal.backend.controller;

import com.jobportal.backend.model.Job;
import com.jobportal.backend.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobRepository jobRepository;

    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String recruiterId,
            @RequestParam(required = false) String recruiterEmail
    ) {
        List<Job> jobs = jobRepository.findAll();

        if (recruiterId != null && !recruiterId.isEmpty()) {
            jobs = jobs.stream()
                    .filter(j -> recruiterId.equalsIgnoreCase(j.getRecruiterId()) ||
                            (j.getRecruiterEmail() != null && j.getRecruiterEmail().equalsIgnoreCase(recruiterEmail)))
                    .collect(Collectors.toList());
        } else if (recruiterEmail != null && !recruiterEmail.isEmpty()) {
            jobs = jobs.stream()
                    .filter(j -> j.getRecruiterEmail() != null && j.getRecruiterEmail().equalsIgnoreCase(recruiterEmail))
                    .collect(Collectors.toList());
        }

        if (q != null && !q.isEmpty()) {
            String queryLower = q.toLowerCase();
            jobs = jobs.stream()
                    .filter(j -> (j.getTitle() != null && j.getTitle().toLowerCase().contains(queryLower)) ||
                            (j.getCompanyName() != null && j.getCompanyName().toLowerCase().contains(queryLower)) ||
                            (j.getSkills() != null && j.getSkills().stream().anyMatch(s -> s != null && s.toLowerCase().contains(queryLower))))
                    .collect(Collectors.toList());
        }

        if (location != null && !location.isEmpty()) {
            String locLower = location.toLowerCase();
            jobs = jobs.stream()
                    .filter(j -> j.getLocation() != null && j.getLocation().toLowerCase().contains(locLower))
                    .collect(Collectors.toList());
        }

        if (type != null && !type.isEmpty()) {
            jobs = jobs.stream()
                    .filter(j -> j.getType() != null && j.getType().equalsIgnoreCase(type))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getJobById(@PathVariable Long id) {
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Job not found");
        }
        return ResponseEntity.ok(jobOpt.get());
    }

    @PostMapping
    public ResponseEntity<Job> createJob(@RequestBody Job job) {
        if (job.getPostedTime() == null) {
            job.setPostedTime("Just now");
        }
        Job savedJob = jobRepository.save(job);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedJob);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @RequestBody Job updatedJob) {
        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Job not found");
        }

        Job job = jobOpt.get();
        if (updatedJob.getTitle() != null) job.setTitle(updatedJob.getTitle());
        if (updatedJob.getLocation() != null) job.setLocation(updatedJob.getLocation());
        if (updatedJob.getSalary() != null) job.setSalary(updatedJob.getSalary());
        if (updatedJob.getExperience() != null) job.setExperience(updatedJob.getExperience());
        if (updatedJob.getType() != null) job.setType(updatedJob.getType());
        if (updatedJob.getSkills() != null) job.setSkills(updatedJob.getSkills());
        if (updatedJob.getDescription() != null) job.setDescription(updatedJob.getDescription());
        if (updatedJob.getResponsibilities() != null) job.setResponsibilities(updatedJob.getResponsibilities());
        if (updatedJob.getQualifications() != null) job.setQualifications(updatedJob.getQualifications());
        if (updatedJob.getBenefits() != null) job.setBenefits(updatedJob.getBenefits());
        if (updatedJob.getRecruiterId() != null) job.setRecruiterId(updatedJob.getRecruiterId());
        if (updatedJob.getRecruiterName() != null) job.setRecruiterName(updatedJob.getRecruiterName());
        if (updatedJob.getRecruiterEmail() != null) job.setRecruiterEmail(updatedJob.getRecruiterEmail());

        Job savedJob = jobRepository.save(job);
        return ResponseEntity.ok(savedJob);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        if (!jobRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Job not found");
        }
        jobRepository.deleteById(id);
        return ResponseEntity.ok("Job deleted successfully");
    }
}

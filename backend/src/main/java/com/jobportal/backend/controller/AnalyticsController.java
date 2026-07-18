package com.jobportal.backend.controller;

import com.jobportal.backend.model.Application;
import com.jobportal.backend.model.Candidate;
import com.jobportal.backend.model.Job;
import com.jobportal.backend.model.User;
import com.jobportal.backend.repository.ApplicationRepository;
import com.jobportal.backend.repository.CandidateRepository;
import com.jobportal.backend.repository.JobRepository;
import com.jobportal.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/seeker")
    public ResponseEntity<?> getSeekerAnalytics(
            @RequestParam(required = false) String candidateId
    ) {
        String queryId = (candidateId != null && !candidateId.isEmpty()) ? candidateId : "1";
        
        List<Application> myApps = applicationRepository.findByCandidateId(queryId);

        long sent = myApps.size();
        long interviews = myApps.stream().filter(a -> "Interviewing".equalsIgnoreCase(a.getStatus())).count();
        long shortlisted = myApps.stream().filter(a -> "Shortlisted".equalsIgnoreCase(a.getStatus())).count();

        int profileCompletion = 40;
        Long cId = 1L;
        try {
            if (candidateId != null && !candidateId.isEmpty()) {
                cId = Long.parseLong(candidateId);
            }
        } catch (NumberFormatException e) {
            cId = 1L;
        }

        Optional<Candidate> candOpt = candidateRepository.findById(cId);
        if (candOpt.isPresent()) {
            Candidate c = candOpt.get();
            int score = 0;
            if (c.getName() != null && !c.getName().isEmpty()) score += 10;
            if (c.getEmail() != null && !c.getEmail().isEmpty()) score += 10;
            if (c.getTitle() != null && !c.getTitle().isEmpty()) score += 15;
            if (c.getPhone() != null && !c.getPhone().isEmpty()) score += 10;
            if (c.getLocation() != null && !c.getLocation().isEmpty()) score += 10;
            if (c.getSkills() != null && !c.getSkills().isEmpty()) score += 15;
            if (c.getSummary() != null && !c.getSummary().isEmpty()) score += 15;
            if (c.getResumeUrl() != null && !c.getResumeUrl().isEmpty()) score += 15;
            profileCompletion = Math.min(100, Math.max(score, 30));
        } else {
            profileCompletion = sent > 0 ? 85 : 45;
        }

        List<Map<String, String>> recentActivity = myApps.stream()
                .limit(5)
                .map(app -> Map.of(
                        "id", String.valueOf(app.getId()),
                        "type", "applied",
                        "text", "Applied for " + (app.getJobTitle() != null ? app.getJobTitle() : "Position") + " at " + (app.getCompanyName() != null ? app.getCompanyName() : "Company"),
                        "date", app.getAppliedDate() != null ? app.getAppliedDate() : "Recently"
                ))
                .toList();

        return ResponseEntity.ok(Map.of(
                "profileCompletion", profileCompletion,
                "applicationsSent", sent,
                "interviewInvitations", interviews,
                "savedJobs", shortlisted,
                "recentActivity", recentActivity
        ));
    }

    @GetMapping("/recruiter")
    public ResponseEntity<?> getRecruiterAnalytics(
            @RequestParam(required = false) String recruiterId
    ) {
        List<Job> allJobs = jobRepository.findAll();
        List<Application> allApps = applicationRepository.findAll();

        if (recruiterId != null && !recruiterId.isEmpty()) {
            allJobs = allJobs.stream()
                    .filter(j -> recruiterId.equalsIgnoreCase(j.getRecruiterId()))
                    .collect(Collectors.toList());
            allApps = allApps.stream()
                    .filter(a -> recruiterId.equalsIgnoreCase(a.getRecruiterId()))
                    .collect(Collectors.toList());
        }

        long jobsPosted = allJobs.size();
        long appsReceived = allApps.size();
        long shortlisted = allApps.stream().filter(a -> "Shortlisted".equalsIgnoreCase(a.getStatus())).count();
        long interviews = allApps.stream().filter(a -> "Interviewing".equalsIgnoreCase(a.getStatus())).count();

        List<Map<String, Object>> recentApps = allApps.stream()
                .limit(5)
                .map(app -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", String.valueOf(app.getId()));
                    map.put("candidateId", app.getCandidateId() != null ? app.getCandidateId() : "");
                    map.put("name", app.getCandidateName() != null ? app.getCandidateName() : "Candidate");
                    map.put("jobTitle", app.getJobTitle() != null ? app.getJobTitle() : "");
                    map.put("matchScore", app.getMatchScore());
                    map.put("status", app.getStatus() != null ? app.getStatus() : "Applied");
                    map.put("date", app.getAppliedDate() != null ? app.getAppliedDate() : "Recently");
                    return map;
                })
                .collect(Collectors.toList());

        Map<String, Long> byJob = allApps.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getJobTitle() != null ? a.getJobTitle() : "Other",
                        Collectors.counting()
                ));

        List<Map<String, Object>> hiringStats = byJob.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(5)
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("label", e.getKey());
                    map.put("count", e.getValue());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "jobsPosted", jobsPosted,
                "applicationsReceived", appsReceived,
                "shortlistedCandidates", shortlisted,
                "interviewsScheduled", interviews,
                "recentApplications", recentApps,
                "hiringStats", hiringStats
        ));
    }

    @GetMapping("/admin")
    public ResponseEntity<?> getAdminAnalytics() {
        long totalUsers = userRepository.count();
        long totalJobs = jobRepository.count();
        long totalApps = applicationRepository.count();
        long totalCandidates = candidateRepository.count();

        long seekers = userRepository.countByRole("seeker");
        long recruiters = userRepository.countByRole("recruiter");

        List<User> recentUsers = userRepository.findTop5ByOrderByIdDesc();

        List<Job> recentJobs = jobRepository.findAll().stream()
                .sorted((a, b) -> Long.compare(b.getId(), a.getId()))
                .limit(5)
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "totalJobs", totalJobs,
                "totalApplications", totalApps,
                "totalCandidates", totalCandidates,
                "totalSeekers", seekers,
                "totalRecruiters", recruiters,
                "recentUsers", recentUsers,
                "recentJobs", recentJobs
        ));
    }
}

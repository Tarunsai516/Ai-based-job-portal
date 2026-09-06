package com.jobportal.backend.controller;

import com.jobportal.backend.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/seeker")
    public ResponseEntity<Map<String, Object>> getSeekerAnalytics(
            @RequestParam(required = false) String candidateId
    ) {
        return ResponseEntity.ok(analyticsService.getSeekerAnalytics(candidateId));
    }

    @GetMapping("/recruiter")
    public ResponseEntity<Map<String, Object>> getRecruiterAnalytics(
            @RequestParam(required = false) String recruiterId
    ) {
        return ResponseEntity.ok(analyticsService.getRecruiterAnalytics(recruiterId));
    }

    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> getAdminAnalytics() {
        return ResponseEntity.ok(analyticsService.getAdminAnalytics());
    }
}

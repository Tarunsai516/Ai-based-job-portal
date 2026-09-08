package com.jobportal.backend.controller;

import com.jobportal.backend.model.Interview;
import com.jobportal.backend.model.enums.InterviewStatus;
import com.jobportal.backend.model.enums.InterviewType;
import com.jobportal.backend.security.CustomUserDetails;
import com.jobportal.backend.security.SecurityUtils;
import com.jobportal.backend.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @PostMapping("/schedule")
    public ResponseEntity<Interview> scheduleInterview(@RequestBody Map<String, Object> payload) {
        Long applicationId = Long.parseLong(payload.get("applicationId").toString());
        LocalDateTime scheduledAt = LocalDateTime.parse(payload.get("scheduledAt").toString());
        int durationMinutes = payload.containsKey("durationMinutes") ? Integer.parseInt(payload.get("durationMinutes").toString()) : 60;
        InterviewType type = payload.containsKey("type") ? InterviewType.valueOf(payload.get("type").toString().toUpperCase()) : InterviewType.TECHNICAL;
        String meetingLink = (String) payload.get("meetingLink");
        String notes = (String) payload.get("notes");

        CustomUserDetails user = SecurityUtils.getCurrentUserDetails();
        Long recruiterId = user != null ? user.getId() : null;

        Interview interview = interviewService.scheduleInterview(applicationId, scheduledAt, durationMinutes, type, meetingLink, notes, recruiterId);
        return ResponseEntity.status(HttpStatus.CREATED).body(interview);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Interview> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload
    ) {
        InterviewStatus status = InterviewStatus.valueOf(payload.get("status").toUpperCase());
        String feedback = payload.get("feedback");
        return ResponseEntity.ok(interviewService.updateInterviewStatus(id, status, feedback));
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<List<Interview>> getByApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(interviewService.getInterviewsByApplication(applicationId));
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<Interview>> getByCandidate(@PathVariable Long candidateId) {
        return ResponseEntity.ok(interviewService.getInterviewsByCandidate(candidateId));
    }

    @GetMapping("/recruiter/{recruiterId}")
    public ResponseEntity<List<Interview>> getByRecruiter(@PathVariable Long recruiterId) {
        return ResponseEntity.ok(interviewService.getInterviewsByRecruiter(recruiterId));
    }
}

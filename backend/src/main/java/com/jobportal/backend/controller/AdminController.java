package com.jobportal.backend.controller;

import com.jobportal.backend.dto.UserDto;
import com.jobportal.backend.model.Application;
import com.jobportal.backend.model.Job;
import com.jobportal.backend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // --- User Management ---
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> dtos = adminService.getAllUsers().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    // --- Job Management ---
    @GetMapping("/jobs")
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(adminService.getAllJobs());
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        adminService.deleteJob(id);
        return ResponseEntity.ok(Map.of("message", "Job deleted successfully"));
    }

    // --- Application Management ---
    @GetMapping("/applications")
    public ResponseEntity<List<Application>> getAllApplications() {
        return ResponseEntity.ok(adminService.getAllApplications());
    }

    @DeleteMapping("/applications/{id}")
    public ResponseEntity<?> deleteApplication(@PathVariable Long id) {
        adminService.deleteApplication(id);
        return ResponseEntity.ok(Map.of("message", "Application deleted successfully"));
    }
}

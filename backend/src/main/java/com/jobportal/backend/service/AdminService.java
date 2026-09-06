package com.jobportal.backend.service;

import com.jobportal.backend.common.exception.ResourceNotFoundException;
import com.jobportal.backend.model.Application;
import com.jobportal.backend.model.Candidate;
import com.jobportal.backend.model.Job;
import com.jobportal.backend.model.User;
import com.jobportal.backend.repository.ApplicationRepository;
import com.jobportal.backend.repository.CandidateRepository;
import com.jobportal.backend.repository.JobRepository;
import com.jobportal.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void deleteUser(Long id) {
        logger.info("Admin deleting user ID {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        userRepository.delete(user);

        if ("seeker".equalsIgnoreCase(user.getRole())) {
            Optional<Candidate> candOpt = candidateRepository.findAll().stream()
                    .filter(c -> c.getEmail() != null && c.getEmail().equalsIgnoreCase(user.getEmail()))
                    .findFirst();
            candOpt.ifPresent(candidateRepository::delete);
        }
    }

    @Transactional(readOnly = true)
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    @Transactional
    public void deleteJob(Long id) {
        logger.info("Admin deleting job ID {}", id);
        if (!jobRepository.existsById(id)) {
            throw new ResourceNotFoundException("Job not found with ID: " + id);
        }
        jobRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    @Transactional
    public void deleteApplication(Long id) {
        logger.info("Admin deleting application ID {}", id);
        if (!applicationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Application not found with ID: " + id);
        }
        applicationRepository.deleteById(id);
    }
}

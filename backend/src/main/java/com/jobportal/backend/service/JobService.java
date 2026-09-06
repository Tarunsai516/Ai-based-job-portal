package com.jobportal.backend.service;

import com.jobportal.backend.common.exception.ResourceNotFoundException;
import com.jobportal.backend.dto.JobRequest;
import com.jobportal.backend.dto.JobResponse;
import com.jobportal.backend.model.Job;
import com.jobportal.backend.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobService {

    private static final Logger logger = LoggerFactory.getLogger(JobService.class);

    @Autowired
    private JobRepository jobRepository;

    @Transactional(readOnly = true)
    public List<JobResponse> getAllJobs(String q, String location, String type, String recruiterId, String recruiterEmail) {
        logger.info("Fetching jobs with filters - q: {}, location: {}, type: {}, recruiterId: {}, recruiterEmail: {}",
                q, location, type, recruiterId, recruiterEmail);

        String rIdParam = (recruiterId != null && !recruiterId.isEmpty()) ? recruiterId : null;
        String rEmailParam = (recruiterId != null && !recruiterId.isEmpty() && recruiterEmail != null && !recruiterEmail.isEmpty()) ? recruiterEmail : null;
        String rEmailOnlyParam = (recruiterId == null || recruiterId.isEmpty()) && (recruiterEmail != null && !recruiterEmail.isEmpty()) ? recruiterEmail : null;
        String qParam = (q != null && !q.trim().isEmpty()) ? q.trim() : null;
        String locParam = (location != null && !location.trim().isEmpty()) ? location.trim() : null;
        String typeParam = (type != null && !type.trim().isEmpty()) ? type.trim() : null;

        List<Job> filteredJobs = jobRepository.filterJobs(rIdParam, rEmailParam, rEmailOnlyParam, qParam, locParam, typeParam);
        return filteredJobs.stream()
                .map(JobResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobResponse getJobById(Long id) {
        logger.info("Fetching job by ID: {}", id);
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + id));
        return JobResponse.fromEntity(job);
    }

    @Transactional
    public JobResponse createJob(JobRequest request) {
        logger.info("Creating new job: {} for company: {}", request.getTitle(), request.getCompanyName());

        Job job = Job.builder()
                .companyId(request.getCompanyId())
                .companyName(request.getCompanyName())
                .companyLogo(request.getCompanyLogo())
                .title(request.getTitle())
                .location(request.getLocation())
                .salary(request.getSalary())
                .experience(request.getExperience())
                .type(request.getType())
                .description(request.getDescription())
                .skills(request.getSkills())
                .responsibilities(request.getResponsibilities())
                .qualifications(request.getQualifications())
                .benefits(request.getBenefits())
                .recruiterId(request.getRecruiterId())
                .recruiterName(request.getRecruiterName())
                .recruiterEmail(request.getRecruiterEmail())
                .postedTime(request.getPostedTime() != null ? request.getPostedTime() : "Just now")
                .build();

        Job saved = jobRepository.save(job);
        return JobResponse.fromEntity(saved);
    }

    @Transactional
    public JobResponse updateJob(Long id, JobRequest request) {
        logger.info("Updating job ID: {}", id);
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with ID: " + id));

        if (request.getTitle() != null) job.setTitle(request.getTitle());
        if (request.getLocation() != null) job.setLocation(request.getLocation());
        if (request.getSalary() != null) job.setSalary(request.getSalary());
        if (request.getExperience() != null) job.setExperience(request.getExperience());
        if (request.getType() != null) job.setType(request.getType());
        if (request.getSkills() != null) job.setSkills(request.getSkills());
        if (request.getDescription() != null) job.setDescription(request.getDescription());
        if (request.getResponsibilities() != null) job.setResponsibilities(request.getResponsibilities());
        if (request.getQualifications() != null) job.setQualifications(request.getQualifications());
        if (request.getBenefits() != null) job.setBenefits(request.getBenefits());
        if (request.getRecruiterId() != null) job.setRecruiterId(request.getRecruiterId());
        if (request.getRecruiterName() != null) job.setRecruiterName(request.getRecruiterName());
        if (request.getRecruiterEmail() != null) job.setRecruiterEmail(request.getRecruiterEmail());

        Job updated = jobRepository.save(job);
        return JobResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteJob(Long id) {
        logger.info("Deleting job ID: {}", id);
        if (!jobRepository.existsById(id)) {
            throw new ResourceNotFoundException("Job not found with ID: " + id);
        }
        jobRepository.deleteById(id);
    }
}

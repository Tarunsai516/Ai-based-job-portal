package com.jobportal.backend.service;

import com.jobportal.backend.common.exception.ResourceNotFoundException;
import com.jobportal.backend.dto.JobRequest;
import com.jobportal.backend.dto.JobResponse;
import com.jobportal.backend.model.Job;
import com.jobportal.backend.repository.JobRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @InjectMocks
    private JobService jobService;

    private Job sampleJob;
    private JobRequest sampleJobRequest;

    @BeforeEach
    void setUp() {
        sampleJob = Job.builder()
                .id(1L)
                .title("Software Engineer")
                .companyName("TechCorp")
                .location("New York, NY")
                .type("Remote")
                .build();

        sampleJobRequest = JobRequest.builder()
                .title("Software Engineer")
                .companyName("TechCorp")
                .location("New York, NY")
                .type("Remote")
                .build();
    }

    @Test
    void createJob_success() {
        when(jobRepository.save(any(Job.class))).thenReturn(sampleJob);

        JobResponse response = jobService.createJob(sampleJobRequest);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Software Engineer", response.getTitle());
        verify(jobRepository, times(1)).save(any(Job.class));
    }

    @Test
    void getJobById_success() {
        when(jobRepository.findById(1L)).thenReturn(Optional.of(sampleJob));

        JobResponse response = jobService.getJobById(1L);

        assertNotNull(response);
        assertEquals("Software Engineer", response.getTitle());
    }

    @Test
    void getJobById_notFound_throwsResourceNotFoundException() {
        when(jobRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> jobService.getJobById(99L));
    }

    @Test
    void deleteJob_notFound_throwsResourceNotFoundException() {
        when(jobRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> jobService.deleteJob(99L));
    }
}

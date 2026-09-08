package com.jobportal.backend.service;

import com.jobportal.backend.common.exception.DuplicateResourceException;
import com.jobportal.backend.dto.ApplicationRequest;
import com.jobportal.backend.dto.ApplicationResponse;
import com.jobportal.backend.model.Application;
import com.jobportal.backend.model.Job;
import com.jobportal.backend.model.MatchResult;
import com.jobportal.backend.model.enums.ApplicationStatus;
import com.jobportal.backend.repository.ApplicationRepository;
import com.jobportal.backend.repository.JobRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private MatchingService matchingService;

    @Mock
    private AuditService auditService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ApplicationService applicationService;

    private ApplicationRequest request;
    private Application application;
    private Job sampleJob;

    @BeforeEach
    void setUp() {
        request = ApplicationRequest.builder()
                .jobId("10")
                .candidateId("1")
                .candidateName("John Doe")
                .build();

        application = Application.builder()
                .id(100L)
                .jobId("10")
                .candidateId("1")
                .candidateName("John Doe")
                .status(ApplicationStatus.APPLIED)
                .build();

        sampleJob = Job.builder()
                .id(10L)
                .title("Software Engineer")
                .companyName("Tech Corp")
                .build();
    }

    @Test
    void applyToJob_success() {
        when(applicationRepository.findByCandidateId("1")).thenReturn(Collections.emptyList());
        when(jobRepository.findById(10L)).thenReturn(Optional.of(sampleJob));
        when(matchingService.calculateMatch(1L, 10L)).thenReturn(
                MatchResult.builder().overallScore(88.0).build()
        );
        when(applicationRepository.save(any(Application.class))).thenReturn(application);

        ApplicationResponse response = applicationService.applyToJob(request);

        assertNotNull(response);
        assertEquals("10", response.getJobId());
        assertEquals("1", response.getCandidateId());
        verify(applicationRepository, times(1)).save(any(Application.class));
    }

    @Test
    void applyToJob_duplicate_throwsDuplicateResourceException() {
        when(applicationRepository.findByCandidateId("1")).thenReturn(List.of(application));

        assertThrows(DuplicateResourceException.class, () -> applicationService.applyToJob(request));
        verify(applicationRepository, never()).save(any(Application.class));
    }
}

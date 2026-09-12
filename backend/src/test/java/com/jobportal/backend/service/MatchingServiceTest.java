package com.jobportal.backend.service;

import com.jobportal.backend.model.Candidate;
import com.jobportal.backend.model.Job;
import com.jobportal.backend.model.MatchResult;
import com.jobportal.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchingServiceTest {

    @Mock
    private CandidateRepository candidateRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private CandidateSkillRepository candidateSkillRepository;

    @Mock
    private JobSkillRepository jobSkillRepository;

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private MatchResultRepository matchResultRepository;

    @Mock
    private SkillService skillService;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private MatchingService matchingService;

    private Candidate sampleCandidate;
    private Job sampleJob;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(matchingService, "weightSemantic", 0.40);
        ReflectionTestUtils.setField(matchingService, "weightSkill", 0.30);
        ReflectionTestUtils.setField(matchingService, "weightExperience", 0.15);
        ReflectionTestUtils.setField(matchingService, "weightLocation", 0.10);
        ReflectionTestUtils.setField(matchingService, "weightEducation", 0.05);

        sampleCandidate = Candidate.builder()
                .id(1L)
                .name("Alice Smith")
                .skills(List.of("Java", "Spring Boot", "React", "PostgreSQL"))
                .experience("5 years")
                .location("New York")
                .education("Bachelor of Science in Computer Science")
                .summary("Experienced Java developer specializing in Spring Boot and microservices")
                .build();

        sampleJob = Job.builder()
                .id(10L)
                .title("Senior Java Developer")
                .skills(List.of("Java", "Spring Boot", "Docker"))
                .experience("3+ years")
                .location("New York")
                .description("Looking for Senior Java Developer with Spring Boot and microservices expertise")
                .qualifications(List.of("Bachelor's degree in Computer Science"))
                .build();
    }

    @Test
    void calculateMatch_computesDeterministicScore() {
        when(candidateRepository.findById(1L)).thenReturn(Optional.of(sampleCandidate));
        when(jobRepository.findById(10L)).thenReturn(Optional.of(sampleJob));
        when(candidateSkillRepository.findByCandidateId(1L)).thenReturn(Collections.emptyList());
        when(jobSkillRepository.findByJobId(10L)).thenReturn(Collections.emptyList());
        when(resumeRepository.findTopByCandidateIdOrderByCreatedAtDesc(1L)).thenReturn(Optional.empty());
        when(matchResultRepository.findByCandidateIdAndJobId(1L, 10L)).thenReturn(Optional.empty());
        when(matchResultRepository.save(any(MatchResult.class))).thenAnswer(i -> i.getArgument(0));

        MatchResult result = matchingService.calculateMatch(1L, 10L);

        assertNotNull(result);
        assertTrue(result.getOverallScore() > 50.0, "Overall score should be high for matching skills and location");
        assertNotNull(result.getExplanation());
        assertNotNull(result.getMatchedSkills());
        verify(matchResultRepository, times(1)).save(any(MatchResult.class));
    }

    @Test
    void skillService_normalizesCommonAliases() {
        SkillService service = new SkillService();

        assertEquals("spring boot", service.normalize("SpringBoot"));
        assertEquals("javascript", service.normalize("JS"));
        assertEquals("postgresql", service.normalize("Postgres"));
        assertEquals("rest api", service.normalize("REST APIs"));
    }

    @Test
    void calculateSkillScore_prioritizesRequiredSkillsAndSeparatesGaps() {
        MatchingService.SkillMatchResult result = MatchingService.calculateSkillScore(
                Set.of("java", "docker"),
                Set.of("java", "spring boot"),
                Set.of("redis", "kafka"));

        assertEquals(1, result.requiredMissing().size());
        assertEquals(Set.of("redis", "kafka"), result.preferredMissing());
        assertEquals(35.0, result.score(), 0.001);
    }
}

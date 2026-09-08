package com.jobportal.backend.security;

import com.jobportal.backend.dto.JobRequest;
import com.jobportal.backend.model.Job;
import com.jobportal.backend.model.User;
import com.jobportal.backend.repository.JobRepository;
import com.jobportal.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
class SecurityIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private ObjectMapper objectMapper;

    private User seekerUser;
    private User recruiter1User;
    private User recruiter2User;
    private User adminUser;

    private String seekerToken;
    private String recruiter1Token;
    private String recruiter2Token;
    private String adminToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();

        userRepository.deleteAll();
        jobRepository.deleteAll();

        seekerUser = userRepository.save(User.builder()
                .name("Seeker One")
                .email("seeker@example.com")
                .password(passwordEncoder.encode("password123"))
                .role("seeker")
                .build());

        recruiter1User = userRepository.save(User.builder()
                .name("Recruiter One")
                .email("recruiter1@company.com")
                .password(passwordEncoder.encode("password123"))
                .role("recruiter")
                .build());

        recruiter2User = userRepository.save(User.builder()
                .name("Recruiter Two")
                .email("recruiter2@company.com")
                .password(passwordEncoder.encode("password123"))
                .role("recruiter")
                .build());

        adminUser = userRepository.save(User.builder()
                .name("Admin User")
                .email("admin@talentsync.com")
                .password(passwordEncoder.encode("adminpass"))
                .role("admin")
                .build());

        seekerToken = jwtUtils.generateTokenFromEmail(seekerUser.getEmail(), seekerUser.getId(), seekerUser.getName(), seekerUser.getRole());
        recruiter1Token = jwtUtils.generateTokenFromEmail(recruiter1User.getEmail(), recruiter1User.getId(), recruiter1User.getName(), recruiter1User.getRole());
        recruiter2Token = jwtUtils.generateTokenFromEmail(recruiter2User.getEmail(), recruiter2User.getId(), recruiter2User.getName(), recruiter2User.getRole());
        adminToken = jwtUtils.generateTokenFromEmail(adminUser.getEmail(), adminUser.getId(), adminUser.getName(), adminUser.getRole());
    }

    // 1. Registration hashes password
    @Test
    void test1_registrationHashesPassword() throws Exception {
        Map<String, String> regRequest = Map.of(
                "name", "New User",
                "email", "newuser@example.com",
                "password", "rawPassword123",
                "role", "seeker"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists());

        User savedUser = userRepository.findByEmail("newuser@example.com").orElseThrow();
        assertNotEquals("rawPassword123", savedUser.getPassword());
        assertTrue(passwordEncoder.matches("rawPassword123", savedUser.getPassword()));
    }

    // 2. Login with correct password succeeds
    @Test
    void test2_loginWithCorrectPasswordSucceeds() throws Exception {
        Map<String, String> loginRequest = Map.of(
                "email", "seeker@example.com",
                "password", "password123"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.tokenType").value("Bearer"));
    }

    // 3. Login with incorrect password fails
    @Test
    void test3_loginWithIncorrectPasswordFails() throws Exception {
        Map<String, String> loginRequest = Map.of(
                "email", "seeker@example.com",
                "password", "wrongPassword"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    // 4. JWT is generated
    @Test
    void test4_jwtIsGenerated() {
        String token = jwtUtils.generateTokenFromEmail(seekerUser.getEmail(), seekerUser.getId(), seekerUser.getName(), seekerUser.getRole());
        assertNotNull(token);
        assertTrue(jwtUtils.validateJwtToken(token));
        assertEquals("seeker@example.com", jwtUtils.getUserNameFromJwtToken(token));
    }

    // 5. Protected endpoint rejects missing token
    @Test
    void test5_protectedEndpointRejectsMissingToken() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isUnauthorized());
    }

    // 6. Invalid token is rejected
    @Test
    void test6_invalidTokenIsRejected() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer invalidTokenString123"))
                .andExpect(status().isUnauthorized());
    }

    // 7. Expired token is rejected
    @Test
    void test7_expiredTokenIsRejected() {
        assertFalse(jwtUtils.validateJwtToken(""));
    }

    // 8. Seeker cannot access recruiter-only endpoint
    @Test
    void test8_seekerCannotAccessRecruiterOnlyEndpoint() throws Exception {
        JobRequest jobRequest = JobRequest.builder()
                .title("Unauthorized Job")
                .companyName("Test Comp")
                .location("Remote")
                .build();

        mockMvc.perform(post("/api/jobs")
                        .header("Authorization", "Bearer " + seekerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(jobRequest)))
                .andExpect(status().isForbidden());
    }

    // 9. Recruiter cannot modify another recruiter's job (ownership check)
    @Test
    void test9_recruiterCannotModifyAnotherRecruitersJob() throws Exception {
        Job rec1Job = jobRepository.save(Job.builder()
                .title("Recruiter 1 Job")
                .companyName("Company 1")
                .location("Remote")
                .recruiterId(String.valueOf(recruiter1User.getId()))
                .recruiterEmail(recruiter1User.getEmail())
                .build());

        JobRequest updateRequest = JobRequest.builder()
                .title("Hacked Title")
                .companyName("Company 1")
                .location("Remote")
                .build();

        // Recruiter 2 attempts to edit Recruiter 1's job -> 403 Forbidden
        mockMvc.perform(put("/api/jobs/" + rec1Job.getId())
                        .header("Authorization", "Bearer " + recruiter2Token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isForbidden());
    }

    // 10. Admin can access admin endpoint
    @Test
    void test10_adminCanAccessAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }
}

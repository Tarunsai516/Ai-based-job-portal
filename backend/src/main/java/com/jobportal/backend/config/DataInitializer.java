package com.jobportal.backend.config;

import com.jobportal.backend.model.*;
import com.jobportal.backend.model.enums.JobStatus;
import com.jobportal.backend.repository.*;
import com.jobportal.backend.service.SkillService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

        private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private CandidateRepository candidateRepository;

        @Autowired
        private JobRepository jobRepository;

        @Autowired
        private SkillService skillService;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Value("${app.admin.name:TalentSync Admin}")
        private String adminName;

        @Value("${app.admin.email:}")
        private String adminEmail;

        @Value("${app.admin.password:}")
        private String adminPassword;

        @Override
        public void run(String... args) throws Exception {
                if (userRepository.count() == 0) {
                        seedUsersAndJobs();
                        logger.info(">>> Database initialized with default user accounts and jobs!");
                }
                ensureConfiguredAdmin();
        }

        private void seedUsersAndJobs() {
                User seeker = User.builder()
                                .name("Alex Johnson")
                                .email("alex@example.com")
                                .password(passwordEncoder.encode("12345"))
                                .role("seeker")
                                .build();
                seeker = userRepository.save(seeker);

                User recruiter = User.builder()
                                .name("Jane Recruiter")
                                .email("jane@company.com")
                                .password(passwordEncoder.encode("12345"))
                                .role("recruiter")
                                .build();
                recruiter = userRepository.save(recruiter);

                ensureConfiguredAdmin();

                // Seed initial candidate profile
                Candidate c1 = Candidate.builder()
                                .userId(seeker.getId())
                                .name("Alex Johnson")
                                .title("Senior Full-Stack Developer")
                                .email("alex@example.com")
                                .phone("+1 (555) 019-2834")
                                .avatar("👨‍💻")
                                .skills(List.of("React", "JavaScript", "TypeScript", "Tailwind CSS", "Java",
                                                "Spring Boot", "PostgreSQL"))
                                .missingSkills(List.of())
                                .experience("5 years")
                                .education("B.S. in Computer Science")
                                .matchScore(95)
                                .location("San Francisco, CA")
                                .resumeUrl("Alex_Johnson_CV.pdf")
                                .summary("Passionate full-stack engineer with expertise in React, TypeScript, Java, Spring Boot, and cloud architecture.")
                                .build();
                candidateRepository.save(c1);

                // Seed initial skills in taxonomy
                List<String> commonSkills = List.of(
                                "React", "JavaScript", "TypeScript", "Tailwind CSS", "Java", "Spring Boot",
                                "PostgreSQL", "Docker", "Kubernetes", "AWS", "Python", "GraphQL", "Redis");
                skillService.findOrCreateAll(commonSkills);

                // Seed sample jobs
                String recruiterIdStr = String.valueOf(recruiter.getId());
                String recruiterEmail = recruiter.getEmail();

                Job j1 = Job.builder()
                                .companyName("TechCorp Solutions")
                                .companyLogo("🚀")
                                .title("Senior Full-Stack Engineer (React & Spring Boot)")
                                .location("San Francisco, CA")
                                .salary("$140,000 - $175,000 / yr")
                                .experience("4+ years")
                                .type("Remote")
                                .description("We are looking for an experienced Senior Full-Stack Engineer to lead development of our flagship cloud SaaS platform.")
                                .skills(List.of("React", "Java", "Spring Boot", "TypeScript", "PostgreSQL", "Docker"))
                                .responsibilities(List.of(
                                                "Design and build scalable microservices using Java and Spring Boot",
                                                "Architect modern, responsive frontend user interfaces using React and Tailwind CSS",
                                                "Collaborate with product and AI teams to deliver intelligent search features"))
                                .qualifications(List.of(
                                                "4+ years of professional full-stack development experience",
                                                "Solid hands-on experience with Spring Boot and React",
                                                "B.S. in Computer Science or equivalent experience"))
                                .benefits(List.of("Health & Dental insurance", "401(k) matching",
                                                "Flexible remote work", "$2,000 learning budget"))
                                .recruiterId(recruiterIdStr)
                                .recruiterName("Jane Recruiter")
                                .recruiterEmail(recruiterEmail)
                                .postedTime("1 day ago")
                                .status(JobStatus.ACTIVE)
                                .build();

                Job j2 = Job.builder()
                                .companyName("CloudScale AI")
                                .companyLogo("⚡")
                                .title("AI & Backend Platform Engineer")
                                .location("New York, NY")
                                .salary("$150,000 - $190,000 / yr")
                                .experience("3+ years")
                                .type("Hybrid")
                                .description("Join our core AI platform engineering team building low-latency embedding retrieval and automated recruitment ranking systems.")
                                .skills(List.of("Java", "Spring Boot", "Python", "PostgreSQL", "Docker", "Redis"))
                                .responsibilities(List.of(
                                                "Develop high-throughput REST APIs and data pipelines",
                                                "Integrate LLM semantic scoring and vector similarity algorithms",
                                                "Optimize database query performance and caching"))
                                .qualifications(List.of(
                                                "Strong Java and Python backend foundations",
                                                "Experience with relational databases and caching systems"))
                                .benefits(List.of("Comprehensive health coverage", "Equity grants",
                                                "Annual company retreats"))
                                .recruiterId(recruiterIdStr)
                                .recruiterName("Jane Recruiter")
                                .recruiterEmail(recruiterEmail)
                                .postedTime("3 days ago")
                                .status(JobStatus.ACTIVE)
                                .build();

                Job j3 = Job.builder()
                                .companyName("PixelCraft Labs")
                                .companyLogo("🎨")
                                .title("Frontend UI/UX Engineer (React & Next.js)")
                                .location("Austin, TX")
                                .salary("$120,000 - $145,000 / yr")
                                .experience("3+ years")
                                .type("Remote")
                                .description("Build captivating, fluid user experiences with micro-animations and intuitive workflows.")
                                .skills(List.of("React", "JavaScript", "TypeScript", "Tailwind CSS"))
                                .responsibilities(List.of(
                                                "Craft pixel-perfect React interfaces from Figma designs",
                                                "Implement dynamic state management and optimistic UI updates"))
                                .qualifications(List.of("Deep mastery of CSS, Tailwind, and React hooks"))
                                .benefits(List.of("Home office stipend", "Flexible PTO", "Health insurance"))
                                .recruiterId(recruiterIdStr)
                                .recruiterName("Jane Recruiter")
                                .recruiterEmail(recruiterEmail)
                                .postedTime("5 days ago")
                                .status(JobStatus.ACTIVE)
                                .build();

                jobRepository.save(j1);
                jobRepository.save(j2);
                jobRepository.save(j3);
        }

        private void ensureConfiguredAdmin() {
                if (adminEmail.isBlank() || adminPassword.isBlank()) {
                        logger.info("No configured admin account found. Set ADMIN_EMAIL and ADMIN_PASSWORD to create one.");
                        return;
                }

                User admin = userRepository.findByEmail(adminEmail).orElseGet(User::new);
                admin.setName(adminName);
                admin.setEmail(adminEmail);
                admin.setRole("admin");
                admin.setActive(true);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                userRepository.save(admin);
                logger.info("Configured admin account is ready for email {}", adminEmail);
        }
}

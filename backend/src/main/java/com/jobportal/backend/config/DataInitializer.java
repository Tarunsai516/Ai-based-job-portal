package com.jobportal.backend.config;

import com.jobportal.backend.model.*;
import com.jobportal.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            seedUsers();
            System.out.println(">>> Database initialized with default user accounts!");
        }
    }

    private void seedUsers() {
        User seeker = User.builder()
                .name("Alex Johnson")
                .email("alex@example.com")
                .password("12345")
                .role("seeker")
                .build();

        User recruiter = User.builder()
                .name("Jane Recruiter")
                .email("jane@company.com")
                .password("12345")
                .role("recruiter")
                .build();

        User admin = User.builder()
                .name("TalentSync Admin")
                .email("admin@talentsync.com")
                .password("admin")
                .role("admin")
                .build();

        userRepository.save(seeker);
        userRepository.save(recruiter);
        userRepository.save(admin);

        // Save initial candidate profile for Alex Johnson
        Candidate c1 = Candidate.builder()
                .name("Alex Johnson")
                .title("Senior Frontend Developer")
                .email("alex@example.com")
                .phone("+1 (555) 019-2834")
                .avatar("👨‍💻")
                .skills(List.of("React", "JavaScript", "Tailwind CSS", "TypeScript"))
                .missingSkills(List.of())
                .experience("5 years")
                .education("B.S. in Computer Science")
                .matchScore(95)
                .location("San Francisco, CA")
                .resumeUrl("Alex_Johnson_CV.pdf")
                .summary("Passionate frontend engineer with experience in React and modern UI systems.")
                .build();
        candidateRepository.save(c1);
    }
}

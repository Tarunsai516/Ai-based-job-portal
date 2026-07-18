package com.jobportal.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "candidates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String title;
    private String email;
    private String phone;
    private String avatar;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "candidate_skills", joinColumns = @JoinColumn(name = "candidate_id"))
    @Column(name = "skill")
    private List<String> skills;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "candidate_missing_skills", joinColumns = @JoinColumn(name = "candidate_id"))
    @Column(name = "missing_skill")
    private List<String> missingSkills;

    private String experience;
    private String education;
    private int matchScore;
    private String location;
    private String resumeUrl;

    @Column(columnDefinition = "TEXT")
    private String summary;
}

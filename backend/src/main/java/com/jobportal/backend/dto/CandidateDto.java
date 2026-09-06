package com.jobportal.backend.dto;

import com.jobportal.backend.model.Candidate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateDto {
    private Long id;
    private String name;
    private String title;
    private String email;
    private String phone;
    private String avatar;
    private List<String> skills;
    private List<String> missingSkills;
    private String experience;
    private String education;
    private int matchScore;
    private String location;
    private String resumeUrl;
    private String summary;

    public static CandidateDto fromEntity(Candidate candidate) {
        if (candidate == null) return null;
        return CandidateDto.builder()
                .id(candidate.getId())
                .name(candidate.getName())
                .title(candidate.getTitle())
                .email(candidate.getEmail())
                .phone(candidate.getPhone())
                .avatar(candidate.getAvatar())
                .skills(candidate.getSkills())
                .missingSkills(candidate.getMissingSkills())
                .experience(candidate.getExperience())
                .education(candidate.getEducation())
                .matchScore(candidate.getMatchScore())
                .location(candidate.getLocation())
                .resumeUrl(candidate.getResumeUrl())
                .summary(candidate.getSummary())
                .build();
    }
}

package com.jobportal.backend.dto;

import com.jobportal.backend.model.Company;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyDto {
    private Long id;
    private String name;
    private String industry;
    private String location;
    private String employees;
    private String website;
    private String description;
    private Long recruiterId;

    public static CompanyDto fromEntity(Company company) {
        if (company == null) return null;
        return CompanyDto.builder()
                .id(company.getId())
                .name(company.getName())
                .industry(company.getIndustry())
                .location(company.getLocation())
                .employees(company.getEmployees())
                .website(company.getWebsite())
                .description(company.getDescription())
                .recruiterId(company.getRecruiterId())
                .build();
    }
}

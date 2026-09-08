package com.jobportal.backend.dto;

import com.jobportal.backend.model.Company;

public class CompanyDto {
    private Long id;
    private String name;
    private String industry;
    private String location;
    private String employees;
    private String website;
    private String description;
    private Long recruiterId;

    public CompanyDto() {}

    public CompanyDto(Long id, String name, String industry, String location, String employees,
                      String website, String description, Long recruiterId) {
        this.id = id;
        this.name = name;
        this.industry = industry;
        this.location = location;
        this.employees = employees;
        this.website = website;
        this.description = description;
        this.recruiterId = recruiterId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getEmployees() { return employees; }
    public void setEmployees(String employees) { this.employees = employees; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getRecruiterId() { return recruiterId; }
    public void setRecruiterId(Long recruiterId) { this.recruiterId = recruiterId; }

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

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String name;
        private String industry;
        private String location;
        private String employees;
        private String website;
        private String description;
        private Long recruiterId;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder industry(String industry) { this.industry = industry; return this; }
        public Builder location(String location) { this.location = location; return this; }
        public Builder employees(String employees) { this.employees = employees; return this; }
        public Builder website(String website) { this.website = website; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder recruiterId(Long recruiterId) { this.recruiterId = recruiterId; return this; }

        public CompanyDto build() {
            return new CompanyDto(id, name, industry, location, employees, website, description, recruiterId);
        }
    }
}

package com.jobportal.backend.service;

import com.jobportal.backend.dto.CompanyDto;
import com.jobportal.backend.model.Company;
import com.jobportal.backend.repository.CompanyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CompanyService {

    private static final Logger logger = LoggerFactory.getLogger(CompanyService.class);

    @Autowired
    private CompanyRepository companyRepository;

    @Transactional
    public CompanyDto getMyCompany() {
        Optional<Company> companyOpt = companyRepository.findFirstByOrderByIdAsc();
        if (companyOpt.isEmpty()) {
            Company defaultCompany = Company.builder()
                    .name("TechVibe Solutions")
                    .industry("Software & Technology")
                    .location("San Francisco, CA")
                    .employees("50-200 employees")
                    .website("https://techvibe.example.com")
                    .description("Leading AI & SaaS software solutions provider.")
                    .build();
            Company saved = companyRepository.save(defaultCompany);
            return CompanyDto.fromEntity(saved);
        }
        return CompanyDto.fromEntity(companyOpt.get());
    }

    @Transactional
    public CompanyDto updateMyCompany(CompanyDto dto) {
        logger.info("Updating recruiter company profile");
        Optional<Company> companyOpt = companyRepository.findFirstByOrderByIdAsc();
        Company company = companyOpt.orElseGet(Company::new);

        company.setName(dto.getName());
        company.setIndustry(dto.getIndustry());
        company.setLocation(dto.getLocation());
        company.setEmployees(dto.getEmployees());
        company.setWebsite(dto.getWebsite());
        company.setDescription(dto.getDescription());

        Company saved = companyRepository.save(company);
        return CompanyDto.fromEntity(saved);
    }
}

package com.jobportal.backend.controller;

import com.jobportal.backend.model.Company;
import com.jobportal.backend.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    @Autowired
    private CompanyRepository companyRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getMyCompany() {
        Optional<Company> companyOpt = companyRepository.findFirstByOrderByIdAsc();
        if (companyOpt.isEmpty()) {
            // Return default company if none created yet
            Company defaultCompany = Company.builder()
                    .name("TechVibe Solutions")
                    .industry("Software & Technology")
                    .location("San Francisco, CA")
                    .employees("50-200 employees")
                    .website("https://techvibe.example.com")
                    .description("Leading AI & SaaS software solutions provider.")
                    .build();
            return ResponseEntity.ok(companyRepository.save(defaultCompany));
        }
        return ResponseEntity.ok(companyOpt.get());
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyCompany(@RequestBody Company updatedCompany) {
        Optional<Company> companyOpt = companyRepository.findFirstByOrderByIdAsc();
        Company company;
        if (companyOpt.isPresent()) {
            company = companyOpt.get();
        } else {
            company = new Company();
        }

        company.setName(updatedCompany.getName());
        company.setIndustry(updatedCompany.getIndustry());
        company.setLocation(updatedCompany.getLocation());
        company.setEmployees(updatedCompany.getEmployees());
        company.setWebsite(updatedCompany.getWebsite());
        company.setDescription(updatedCompany.getDescription());

        Company saved = companyRepository.save(company);
        return ResponseEntity.ok(saved);
    }
}

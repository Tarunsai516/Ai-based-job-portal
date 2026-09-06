package com.jobportal.backend.controller;

import com.jobportal.backend.dto.CompanyDto;
import com.jobportal.backend.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @GetMapping("/me")
    public ResponseEntity<CompanyDto> getMyCompany() {
        return ResponseEntity.ok(companyService.getMyCompany());
    }

    @PutMapping("/me")
    public ResponseEntity<CompanyDto> updateMyCompany(@RequestBody CompanyDto companyDto) {
        return ResponseEntity.ok(companyService.updateMyCompany(companyDto));
    }
}

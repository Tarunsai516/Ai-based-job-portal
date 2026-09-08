package com.jobportal.backend.controller;

import com.jobportal.backend.model.Skill;
import com.jobportal.backend.service.SkillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    @Autowired
    private SkillService skillService;

    @GetMapping
    public ResponseEntity<List<Skill>> getAllSkills(@RequestParam(required = false) String q) {
        if (q != null && !q.trim().isEmpty()) {
            return ResponseEntity.ok(skillService.searchSkills(q.trim()));
        }
        return ResponseEntity.ok(skillService.getAllSkills());
    }

    @PostMapping
    public ResponseEntity<Skill> createOrFindSkill(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        return ResponseEntity.ok(skillService.findOrCreate(name));
    }
}

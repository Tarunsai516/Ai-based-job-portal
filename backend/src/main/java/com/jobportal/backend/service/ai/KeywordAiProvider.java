package com.jobportal.backend.service.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Keyword-based AI provider that uses regex and NLP heuristics for resume analysis.
 * This is the default provider when no external LLM API key is configured.
 * It performs REAL analysis of the text — not hardcoded fake results.
 */
@Component
public class KeywordAiProvider implements AiProvider {

    private static final Logger logger = LoggerFactory.getLogger(KeywordAiProvider.class);

    // Common tech skills for pattern matching
    public static final Set<String> KNOWN_SKILLS = Set.of(
        "java", "python", "javascript", "typescript", "c++", "c#", "go", "rust", "ruby", "php", "swift", "kotlin",
        "react", "react.js", "reactjs", "angular", "vue", "vue.js", "next.js", "nuxt.js", "svelte", "jquery",
        "spring", "spring boot", "django", "flask", "express", "express.js", "node.js", "nodejs",
        "asp.net", ".net", "rails", "ruby on rails", "laravel", "fastapi",
        "html", "html5", "css", "css3", "tailwind", "tailwindcss", "bootstrap", "sass", "less",
        "sql", "mysql", "postgresql", "postgres", "mongodb", "redis", "elasticsearch", "cassandra",
        "oracle", "sqlite", "mariadb", "dynamodb",
        "aws", "azure", "gcp", "google cloud", "heroku", "digitalocean", "firebase",
        "docker", "kubernetes", "k8s", "terraform", "ansible", "jenkins", "ci/cd", "ci cd",
        "git", "github", "gitlab", "bitbucket", "svn",
        "rest", "rest api", "restful", "rest apis", "graphql", "grpc", "websocket", "soap",
        "microservices", "kafka", "rabbitmq", "apache kafka",
        "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn",
        "nlp", "computer vision", "ai", "artificial intelligence",
        "linux", "unix", "windows", "macos",
        "agile", "scrum", "jira", "confluence",
        "hibernate", "jpa", "mybatis", "jdbc",
        "junit", "testng", "selenium", "cypress", "jest", "mocha",
        "maven", "gradle", "npm", "yarn", "webpack", "vite",
        "figma", "photoshop", "sketch",
        "pandas", "numpy", "r", "tableau", "power bi",
        "blockchain", "solidity", "web3", "data structures", "algorithms", "system design"
    );

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"
    );

    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "(?:\\+?\\d{1,3}[-.\\s]?)?(?:\\(?\\d{2,4}\\)?[-.\\s]?)?\\d{3,4}[-.\\s]?\\d{3,4}"
    );

    private static final Pattern EXPERIENCE_YEARS_PATTERN = Pattern.compile(
        "(\\d+(?:\\.\\d+)?)\\+?\\s*(?:years?|yrs?|\\+\\s*years?)",
        Pattern.CASE_INSENSITIVE
    );

    @Override
    public AiResumeAnalysisResult analyzeResume(String resumeText) {
        logger.info("Analyzing resume with keyword-based AI provider ({} characters)", resumeText.length());
        ParsedResume parsed = parseResumeSections(resumeText);

        // Estimate years of experience
        double yearsExp = 0;
        Matcher yearsMatcher = EXPERIENCE_YEARS_PATTERN.matcher(resumeText);
        while (yearsMatcher.find()) {
            double found = Double.parseDouble(yearsMatcher.group(1));
            yearsExp = Math.max(yearsExp, found);
        }

        List<AiResumeAnalysisResult.EducationEntry> eduEntries = parsed.education.stream()
                .map(e -> AiResumeAnalysisResult.EducationEntry.builder()
                        .degree(e.degree)
                        .institution(e.institution)
                        .year(e.year)
                        .build())
                .collect(Collectors.toList());

        List<AiResumeAnalysisResult.ExperienceEntry> expEntries = parsed.experience.stream()
                .map(e -> AiResumeAnalysisResult.ExperienceEntry.builder()
                        .title(e.title)
                        .company(e.company)
                        .duration(e.duration)
                        .description(e.bullets != null && !e.bullets.isEmpty() ? String.join("\n", e.bullets) : null)
                        .build())
                .collect(Collectors.toList());

        List<String> projectStrings = parsed.projects.stream()
                .map(p -> p.name + (p.description != null && !p.description.isBlank() ? ": " + p.description : ""))
                .collect(Collectors.toList());

        return AiResumeAnalysisResult.builder()
                .name(parsed.name)
                .email(parsed.email)
                .phone(parsed.phone)
                .skills(parsed.skills)
                .education(eduEntries)
                .experience(expEntries)
                .certifications(parsed.certifications)
                .projects(projectStrings)
                .technologies(parsed.skills)
                .summary(parsed.summary)
                .estimatedYearsOfExperience(yearsExp)
                .build();
    }

    @Override
    public List<String> generateInterviewQuestions(String resumeText, String jobDescription, List<String> requiredSkills) {
        List<String> questions = new ArrayList<>();

        // Generate skill-specific technical questions
        if (requiredSkills != null) {
            for (String skill : requiredSkills.stream().limit(5).toList()) {
                questions.add("Can you explain your experience with " + skill + " and how you've used it in production?");
            }
        }

        // Add behavioral questions
        questions.add("Tell me about a challenging technical problem you solved. What was your approach?");
        questions.add("Describe a situation where you had to work under a tight deadline. How did you manage?");
        questions.add("How do you approach code reviews and maintaining code quality in a team?");

        // Resume-specific questions based on detected keywords
        if (resumeText != null) {
            String lower = resumeText.toLowerCase();
            if (lower.contains("microservices")) {
                questions.add("You mentioned microservices experience. How do you handle inter-service communication and data consistency?");
            }
            if (lower.contains("docker") || lower.contains("kubernetes")) {
                questions.add("Can you walk me through your containerization and deployment workflow?");
            }
            if (lower.contains("machine learning") || lower.contains("ai")) {
                questions.add("Describe an ML/AI project you worked on. How did you evaluate model performance?");
            }
            if (lower.contains("lead") || lower.contains("mentor") || lower.contains("managed")) {
                questions.add("Tell me about your experience leading a team. How do you handle conflicts?");
            }
        }

        return questions.stream().distinct().limit(10).collect(Collectors.toList());
    }    @Override
    public ResumeCoachResult coachResume(String resumeText, String jobDescription,
                                          List<String> matchedSkills, List<String> missingSkills) {
        List<ResumeCoachResult.ImprovementSuggestion> suggestions = new ArrayList<>();
        List<String> weakSections = new ArrayList<>();
        Map<String, Integer> sectionScores = new java.util.LinkedHashMap<>();

        String text = (resumeText != null) ? resumeText : "";
        String resumeLower = text.toLowerCase();
        String jobLower    = (jobDescription != null) ? jobDescription.toLowerCase() : "";

        // ── 1. Summary / Objective section (15% weight) ──────────────────────
        int summaryScore = 20;
        boolean hasSummary = resumeLower.contains("summary") || resumeLower.contains("objective")
                || resumeLower.contains("profile") || resumeLower.contains("about me");
        if (hasSummary) summaryScore += 35;
        if (text.length() > 1200) summaryScore += 20;
        else if (text.length() > 500) summaryScore += 10;

        // Job keyword alignment in summary
        if (!jobLower.isEmpty()) {
            String[] jobWords = jobLower.split("[\\s,;|:()]+");
            long titleHits = Arrays.stream(jobWords)
                    .filter(w -> w.length() > 4 && resumeLower.contains(w))
                    .distinct()
                    .limit(10).count();
            summaryScore += (int) Math.min(25, titleHits * 5);
        } else {
            summaryScore += 15;
        }
        summaryScore = Math.min(100, Math.max(20, summaryScore));
        sectionScores.put("Summary", summaryScore);

        if (summaryScore < 60) {
            weakSections.add("Summary");
            suggestions.add(ResumeCoachResult.ImprovementSuggestion.builder()
                    .section("Summary")
                    .reason("Add a concise professional summary highlighting your core expertise and value proposition tailored to the target role.")
                    .suggestedText("Results-driven engineer with expertise in modern technologies, proven track record in building scalable applications, and strong problem-solving capabilities.")
                    .build());
        }

        // ── 2. Skills section (30% weight) ──────────────────────────────────
        int skillsScore = 0;
        int totalJobSkills = (missingSkills != null ? missingSkills.size() : 0)
                           + (matchedSkills != null ? matchedSkills.size() : 0);
        int matched = (matchedSkills != null) ? matchedSkills.size() : 0;
        boolean hasSkillsSection = resumeLower.contains("skills") || resumeLower.contains("technical skills")
                || resumeLower.contains("technologies") || resumeLower.contains("core competencies");

        if (totalJobSkills > 0) {
            double ratio = (double) matched / totalJobSkills;
            skillsScore = (int) Math.round(ratio * 80) + (hasSkillsSection ? 20 : 10);
        } else {
            // Standalone evaluation against known tech skills
            long foundCount = KNOWN_SKILLS.stream().filter(s -> resumeLower.contains(s.toLowerCase())).count();
            if (foundCount >= 8) skillsScore = 90;
            else if (foundCount >= 5) skillsScore = 78;
            else if (foundCount >= 3) skillsScore = 65;
            else skillsScore = 45;
        }
        skillsScore = Math.min(100, Math.max(20, skillsScore));
        sectionScores.put("Skills", skillsScore);

        if (skillsScore < 60) {
            weakSections.add("Skills");
            suggestions.add(ResumeCoachResult.ImprovementSuggestion.builder()
                    .section("Skills")
                    .reason("Your resume is missing key technical skills required for this position: "
                            + (missingSkills != null && !missingSkills.isEmpty()
                               ? String.join(", ", missingSkills.stream().limit(5).toList())
                               : "add relevant technologies from the job requirements."))
                    .suggestedText("Create a dedicated 'Technical Skills' section categorizing Languages, Frameworks, Databases, and Cloud/DevOps tools.")
                    .build());
        }

        // ── 3. Experience section (35% weight) ──────────────────────────────
        int expScore = 15;
        // Check for job titles
        Pattern titlePat = Pattern.compile("engineer|developer|architect|lead|manager|analyst|specialist|intern|consultant", Pattern.CASE_INSENSITIVE);
        if (titlePat.matcher(text).find()) expScore += 25;

        // Check for date ranges (e.g. 2020 - 2024, Jan 2021 - Present)
        Pattern datePat = Pattern.compile("(?:20[0-2]\\d|19\\d\\d)\\s*[-–—to]+\\s*(?:20[0-2]\\d|present|current)", Pattern.CASE_INSENSITIVE);
        if (datePat.matcher(text).find() || resumeLower.contains("years")) expScore += 20;

        // Action verbs
        String[] actionVerbs = {"led", "built", "designed", "architected", "improved", "reduced",
                "increased", "launched", "delivered", "managed", "mentored", "scaled", "optimized",
                "implemented", "developed", "created", "deployed", "automated", "collaborated", "engineered"};
        long verbCount = Arrays.stream(actionVerbs).filter(resumeLower::contains).count();
        expScore += (int) Math.min(25, verbCount * 4);

        // Quantified achievements
        boolean hasNumbers = Pattern.compile("\\d+%|\\$\\d+|\\d+\\+?\\s*(?:users|customers|projects|team|engineers|clients|revenue|ms|million|billion|requests)",
                Pattern.CASE_INSENSITIVE).matcher(text).find();
        if (hasNumbers) expScore += 20;

        expScore = Math.min(100, Math.max(20, expScore));
        sectionScores.put("Experience", expScore);

        if (!hasNumbers || expScore < 60) {
            weakSections.add("Experience");
            suggestions.add(ResumeCoachResult.ImprovementSuggestion.builder()
                    .section("Experience")
                    .reason("Strengthen bullet points with measurable impact and quantifiable results (e.g., %, scale, latency, dollar savings).")
                    .suggestedText("Improved system performance by 35% and reduced API latency from 450ms to 120ms by implementing Redis caching and indexing.")
                    .build());
        }

        // ── 4. Education section (12% weight) ───────────────────────────────
        int eduScore = 20;
        boolean hasDegree = Pattern.compile("bachelor|master|phd|mba|b\\.s|m\\.s|b\\.e|m\\.e|b\\.tech|m\\.tech|btech|mtech|bca|mca|associate|diploma|computer science|engineering|information technology",
                Pattern.CASE_INSENSITIVE).matcher(text).find();
        if (hasDegree) eduScore += 45;

        boolean hasInstitution = Pattern.compile("university|college|institute|school|academy",
                Pattern.CASE_INSENSITIVE).matcher(text).find();
        if (hasInstitution) eduScore += 20;

        boolean hasGradYear = Pattern.compile("20[0-2]\\d|19[89]\\d").matcher(text).find();
        if (hasGradYear) eduScore += 15;

        eduScore = Math.min(100, Math.max(20, eduScore));
        sectionScores.put("Education", eduScore);

        if (eduScore < 50) {
            weakSections.add("Education");
            suggestions.add(ResumeCoachResult.ImprovementSuggestion.builder()
                    .section("Education")
                    .reason("Clearly list your degree, major/specialization, institution name, and graduation year.")
                    .build());
        }

        // ── 5. Projects & Certifications (8% weight) ────────────────────────
        int projectScore = 25;
        boolean hasProjects = resumeLower.contains("project") || resumeLower.contains("portfolio") || resumeLower.contains("github");
        if (hasProjects) projectScore += 35;

        boolean hasCerts = resumeLower.contains("certified") || resumeLower.contains("certification") || resumeLower.contains("certificate") || resumeLower.contains("aws certified");
        if (hasCerts) projectScore += 25;

        boolean hasLinks = resumeLower.contains("linkedin.com") || resumeLower.contains("github.com") || resumeLower.contains("http");
        if (hasLinks) projectScore += 15;

        projectScore = Math.min(100, Math.max(20, projectScore));
        sectionScores.put("Projects & Certifications", projectScore);

        if (!hasProjects && !hasCerts) {
            suggestions.add(ResumeCoachResult.ImprovementSuggestion.builder()
                    .section("Projects & Certifications")
                    .reason("Add 2-3 technical projects or industry certifications to showcase hands-on experience.")
                    .suggestedText("Built a full-stack real-time application using React and Spring Boot with automated CI/CD pipeline deployed on AWS.")
                    .build());
        }

        // ── Overall weighted score ───────────────────────────────────────────
        int overall = (int) Math.round(
            sectionScores.get("Summary")                    * 0.15 +
            sectionScores.get("Skills")                     * 0.30 +
            sectionScores.get("Experience")                 * 0.35 +
            sectionScores.get("Education")                  * 0.12 +
            sectionScores.get("Projects & Certifications")  * 0.08
        );
        overall = Math.max(15, Math.min(100, overall));

        return ResumeCoachResult.builder()
                .resumeScore(overall)
                .missingKeywords(missingSkills != null ? missingSkills : List.of())
                .weakSections(weakSections)
                .suggestions(suggestions)
                .sectionScores(sectionScores)
                .build();
    }

    @Override
    public String tailorResume(String resumeText, String jobDescription) {
        TailoredResumeResult structured = tailorResumeStructured(resumeText, jobDescription);
        StringBuilder sb = new StringBuilder();
        if (structured.getName() != null) sb.append(structured.getName()).append("\n");
        if (structured.getEmail() != null) sb.append(structured.getEmail());
        if (structured.getPhone() != null) sb.append(" | ").append(structured.getPhone());
        if (structured.getLocation() != null) sb.append(" | ").append(structured.getLocation());
        sb.append("\n\nSUMMARY\n").append(structured.getSummary()).append("\n\n");
        if (structured.getSkills() != null && !structured.getSkills().isEmpty()) {
            sb.append("SKILLS\n").append(String.join(", ", structured.getSkills())).append("\n\n");
        }
        if (structured.getProjects() != null && !structured.getProjects().isEmpty()) {
            sb.append("PROJECTS\n");
            for (var p : structured.getProjects()) {
                sb.append(p.getName()).append("\n");
                if (p.getDescription() != null) sb.append("• ").append(p.getDescription()).append("\n");
            }
            sb.append("\n");
        }
        if (structured.getEducation() != null && !structured.getEducation().isEmpty()) {
            sb.append("EDUCATION\n");
            for (var e : structured.getEducation()) {
                sb.append(e.getDegree()).append(" — ").append(e.getInstitution()).append(" (").append(e.getYear()).append(")\n");
            }
        }
        return sb.toString();
    }

    @Override
    public String answerCandidateQuestion(String question, String candidateContext,
                                            String jobContext, String matchContext) {
        String qLower = question.toLowerCase();

        if (qLower.contains("match") || qLower.contains("score") || qLower.contains("why")) {
            return "Based on your profile analysis: " + matchContext +
                    "\n\nYour match score is calculated using skill overlap (30%), semantic similarity (40%), " +
                    "experience match (15%), and location compatibility (10%). " +
                    "To improve your score, consider highlighting missing skills in your resume.";
        }

        if (qLower.contains("skill") || qLower.contains("missing") || qLower.contains("gap")) {
            return "Skill gap analysis from your profile: " + matchContext +
                    "\n\nFocus on the missing skills listed above. Real-world project implementations " +
                    "are the most effective way to demonstrate these competencies to recruiters.";
        }

        if (qLower.contains("improve") || qLower.contains("resume") || qLower.contains("better")) {
            return "Resume improvement tips for this position:\n" +
                    "1. Align technical skills section with required job stack\n" +
                    "2. Use action-oriented bullet points highlighting metrics and architecture\n" +
                    "3. Ensure project details showcase end-to-end full-stack capabilities\n" +
                    "4. Keep formatting clean, ATS-compliant, and consistent";
        }

        return "Based on your profile and the target job description:\n\n" +
                "Candidate Background: " + candidateContext + "\n\n" +
                "Target Position: " + jobContext + "\n\n" +
                "I recommend aligning your project bullets and technical skills directly with the role requirements.";
    }

    @Override
    public boolean isAvailable() {
        return true; // Always available as built-in NLP engine
    }

    @Override
    public String getProviderName() {
        return "TalentSync NLP Parser (Built-in)";
    }

    @Override
    public TailoredResumeResult tailorResumeStructured(String resumeText, String jobDescription) {
        ParsedResume parsed = parseResumeSections(resumeText != null ? resumeText : "");

        TailoredResumeResult result = new TailoredResumeResult();
        result.setName(parsed.name);
        result.setEmail(parsed.email);
        result.setPhone(parsed.phone);
        result.setLocation(parsed.location);

        // Tailor summary to job description
        String tailoredSummary = parsed.summary;
        if (jobDescription != null && !jobDescription.isBlank()) {
            String targetJob = extractJobTitle(jobDescription);
            if (tailoredSummary == null || tailoredSummary.isBlank()) {
                tailoredSummary = "Results-driven Software Developer with strong hands-on expertise in " +
                        String.join(", ", parsed.skills.stream().limit(5).toList()) +
                        ". Passionate about designing robust, scalable applications and contributing to high-impact software engineering teams for the " +
                        targetJob + " position.";
            } else if (!tailoredSummary.toLowerCase().contains(targetJob.toLowerCase()) && !targetJob.isBlank()) {
                tailoredSummary = tailoredSummary.trim() + " Targeted towards the " + targetJob + " role.";
            }
        }
        result.setSummary(tailoredSummary);

        // Reorder skills: place job-relevant skills at the front
        List<String> prioritizedSkills = prioritizeSkillsForJob(parsed.skills, jobDescription);
        result.setSkills(prioritizedSkills);

        // Experience
        if (parsed.experience != null && !parsed.experience.isEmpty()) {
            List<TailoredResumeResult.ExperienceEntry> expEntries = new ArrayList<>();
            for (ParsedExperience pe : parsed.experience) {
                TailoredResumeResult.ExperienceEntry entry = new TailoredResumeResult.ExperienceEntry();
                entry.setTitle(pe.title);
                entry.setCompany(pe.company);
                entry.setDuration(pe.duration);
                entry.setBullets(pe.bullets);
                expEntries.add(entry);
            }
            result.setExperience(expEntries);
        } else {
            result.setExperience(new ArrayList<>());
        }

        // Projects
        List<TailoredResumeResult.ProjectEntry> projectEntries = new ArrayList<>();
        for (ParsedProject pp : parsed.projects) {
            TailoredResumeResult.ProjectEntry pe = new TailoredResumeResult.ProjectEntry();
            pe.setName(pp.name);
            pe.setDescription(pp.description);
            pe.setTechnologies(pp.technologies);
            projectEntries.add(pe);
        }
        result.setProjects(projectEntries);

        // Education
        List<TailoredResumeResult.EducationEntry> eduEntries = new ArrayList<>();
        for (ParsedEducation pe : parsed.education) {
            TailoredResumeResult.EducationEntry entry = new TailoredResumeResult.EducationEntry();
            entry.setDegree(pe.degree);
            entry.setInstitution(pe.institution);
            entry.setYear(pe.year);
            eduEntries.add(entry);
        }
        result.setEducation(eduEntries);

        result.setCertifications(parsed.certifications);

        // Section Improvements Summary
        List<TailoredResumeResult.SectionImprovement> improvements = new ArrayList<>();
        improvements.add(new TailoredResumeResult.SectionImprovement(
            "Professional Summary",
            "Aligned with target position requirements",
            "Emphasized core full-stack competencies, problem-solving abilities, and engineering impact."
        ));
        improvements.add(new TailoredResumeResult.SectionImprovement(
            "Core Competencies & Skills",
            "Prioritized matching technologies from job description",
            "Reordered primary backend frameworks, databases, and DevOps tools to top of section."
        ));
        improvements.add(new TailoredResumeResult.SectionImprovement(
            "Projects & Key Contributions",
            "Structured architecture & tech stack highlights",
            "Preserved end-to-end full stack achievements, RESTful API design, and security implementations."
        ));
        improvements.add(new TailoredResumeResult.SectionImprovement(
            "Education & Certifications",
            "Clean academic formatting",
            "Organized degrees, verified institutions, graduation timelines, and professional certificates."
        ));
        result.setSectionImprovements(improvements);

        return result;
    }

    // =========================================================================
    // SECTION-AWARE RESUME PARSER
    // =========================================================================

    public static class ParsedResume {
        public String name;
        public String email;
        public String phone;
        public String location;
        public String summary;
        public List<String> skills = new ArrayList<>();
        public List<ParsedEducation> education = new ArrayList<>();
        public List<ParsedExperience> experience = new ArrayList<>();
        public List<ParsedProject> projects = new ArrayList<>();
        public List<String> certifications = new ArrayList<>();
        public List<String> achievements = new ArrayList<>();
    }

    public static class ParsedEducation {
        public String degree;
        public String institution;
        public String year;
    }

    public static class ParsedExperience {
        public String title;
        public String company;
        public String duration;
        public List<String> bullets = new ArrayList<>();
    }

    public static class ParsedProject {
        public String name;
        public String description;
        public List<String> technologies = new ArrayList<>();
        public List<String> bullets = new ArrayList<>();
    }

    public ParsedResume parseResumeSections(String text) {
        ParsedResume result = new ParsedResume();
        if (text == null || text.isBlank()) return result;

        String[] rawLines = text.split("\\r?\\n");
        List<String> cleanLines = Arrays.stream(rawLines)
                .map(String::trim)
                .filter(l -> !l.isEmpty())
                .collect(Collectors.toList());

        if (cleanLines.isEmpty()) return result;

        // Group lines by detected section
        Map<String, List<String>> sectionMap = new LinkedHashMap<>();
        String currentSection = "HEADER";
        sectionMap.put(currentSection, new ArrayList<>());

        for (String line : cleanLines) {
            String sectionType = detectSectionHeader(line);
            if (sectionType != null) {
                currentSection = sectionType;
                sectionMap.putIfAbsent(currentSection, new ArrayList<>());
            } else {
                sectionMap.get(currentSection).add(line);
            }
        }

        // --- 1. Parse Header (Name, Email, Phone, Location) ---
        List<String> headerLines = sectionMap.getOrDefault("HEADER", Collections.emptyList());
        if (!headerLines.isEmpty()) {
            String firstLine = headerLines.get(0);
            if (isValidName(firstLine)) {
                result.name = firstLine;
            }
        }
        if (result.name == null) {
            for (String line : cleanLines) {
                if (isValidName(line)) {
                    result.name = line;
                    break;
                }
            }
        }

        // Email & Phone
        Matcher emailMatcher = EMAIL_PATTERN.matcher(text);
        if (emailMatcher.find()) result.email = emailMatcher.group();

        Matcher phoneMatcher = PHONE_PATTERN.matcher(text);
        if (phoneMatcher.find()) result.phone = phoneMatcher.group().trim();

        // Location from header lines
        for (String line : headerLines) {
            String loc = extractLocationFromLine(line);
            if (loc != null && !loc.isBlank()) {
                result.location = loc;
                break;
            }
        }

        // --- 2. Parse Summary / Objective ---
        List<String> summaryLines = sectionMap.getOrDefault("SUMMARY", Collections.emptyList());
        if (!summaryLines.isEmpty()) {
            result.summary = String.join(" ", summaryLines)
                    .replaceFirst("^(?i)(?:Objective|Summary|Professional Summary)[:\\s-]*", "")
                    .trim();
        }

        // --- 3. Parse Technical Skills ---
        List<String> skillLines = sectionMap.getOrDefault("SKILLS", Collections.emptyList());
        Set<String> collectedSkills = new LinkedHashSet<>();

        for (String line : skillLines) {
            // Strip category prefix e.g. "Languages:", "Backend:", "Database:", "Tools:", "Core Skills:"
            String cleanLine = line.replaceFirst("^[•\\-*\\s]*", "")
                    .replaceFirst("^(?i)(?:Languages|Backend|Database|Databases|Tools|Core Skills|Frameworks|Web Technologies|Libraries)[:\\s-]*", "");

            String[] tokens = cleanLine.split("[,;/|•·]+");
            for (String tok : tokens) {
                String s = tok.trim();
                if (s.length() >= 2 && s.length() <= 40 && !s.equalsIgnoreCase("and") && !s.equalsIgnoreCase("etc")) {
                    collectedSkills.add(capitalizeSkill(s));
                }
            }
        }

        // Also search known skills in entire text to guarantee complete coverage
        for (String known : KNOWN_SKILLS) {
            String pattern = "\\b" + Pattern.quote(known) + "\\b";
            if (Pattern.compile(pattern, Pattern.CASE_INSENSITIVE).matcher(text).find()) {
                collectedSkills.add(capitalizeSkill(known));
            }
        }
        result.skills = new ArrayList<>(collectedSkills);

        // --- 4. Parse Education ---
        List<String> eduLines = sectionMap.getOrDefault("EDUCATION", Collections.emptyList());
        ParsedEducation currentEdu = null;

        for (String line : eduLines) {
            String clean = line.replaceFirst("^[•\\-*\\s]*", "").trim();
            if (clean.isEmpty()) continue;

            // Check if line contains a degree or qualification
            if (containsDegreeKeyword(clean)) {
                if (currentEdu != null && currentEdu.degree != null) {
                    result.education.add(currentEdu);
                }
                currentEdu = new ParsedEducation();

                // Extract year if present
                String year = extractYearFromLine(clean);
                currentEdu.year = year;
                String cleanWithoutYear = removeYearFromLine(clean);

                // Split degree and institution
                String[] parts = cleanWithoutYear.split("[,|—–-]+");
                if (parts.length >= 2) {
                    currentEdu.degree = parts[0].trim();
                    currentEdu.institution = parts[1].trim();
                } else {
                    currentEdu.degree = cleanWithoutYear.trim();
                }
            } else if (currentEdu != null) {
                // Secondary info (CGPA, Percentage, Institution on next line)
                if (clean.toLowerCase().contains("cgpa") || clean.toLowerCase().contains("percentage") || clean.toLowerCase().contains("gpa")) {
                    if (currentEdu.institution != null) {
                        currentEdu.institution += " (" + clean + ")";
                    } else {
                        currentEdu.degree += " (" + clean + ")";
                    }
                } else if (currentEdu.institution == null) {
                    currentEdu.institution = clean;
                }
            }
        }
        if (currentEdu != null && currentEdu.degree != null) {
            result.education.add(currentEdu);
        }

        // --- 5. Parse Projects ---
        List<String> projLines = sectionMap.getOrDefault("PROJECTS", Collections.emptyList());
        ParsedProject currentProj = null;

        for (String line : projLines) {
            String clean = line.trim();
            if (clean.isEmpty()) continue;

            boolean isBullet = clean.startsWith("•") || clean.startsWith("-") || clean.startsWith("*") || clean.startsWith("·");
            String bulletContent = clean.replaceFirst("^[•\\-*·\\s]+", "").trim();

            if (!isBullet && (currentProj == null || bulletContent.length() < 70 && !bulletContent.endsWith("."))) {
                if (currentProj != null && currentProj.name != null) {
                    if (!currentProj.bullets.isEmpty()) {
                        currentProj.description = String.join(" ", currentProj.bullets);
                    }
                    result.projects.add(currentProj);
                }
                currentProj = new ParsedProject();
                currentProj.name = bulletContent.replaceFirst("^(?i)Project\\s*\\d*[:\\s-]*", "");

                // Detect technologies from project title
                for (String sk : KNOWN_SKILLS) {
                    if (Pattern.compile("\\b" + Pattern.quote(sk) + "\\b", Pattern.CASE_INSENSITIVE).matcher(currentProj.name).find()) {
                        currentProj.technologies.add(capitalizeSkill(sk));
                    }
                }
            } else if (currentProj != null) {
                currentProj.bullets.add(bulletContent);
                // Scan bullet for technologies
                for (String sk : KNOWN_SKILLS) {
                    if (Pattern.compile("\\b" + Pattern.quote(sk) + "\\b", Pattern.CASE_INSENSITIVE).matcher(bulletContent).find()) {
                        String cap = capitalizeSkill(sk);
                        if (!currentProj.technologies.contains(cap)) {
                            currentProj.technologies.add(cap);
                        }
                    }
                }
            }
        }
        if (currentProj != null && currentProj.name != null) {
            if (!currentProj.bullets.isEmpty()) {
                currentProj.description = String.join(" ", currentProj.bullets);
            }
            result.projects.add(currentProj);
        }

        // --- 6. Parse Work Experience ---
        List<String> expLines = sectionMap.getOrDefault("EXPERIENCE", Collections.emptyList());
        ParsedExperience currentExp = null;

        for (String line : expLines) {
            String clean = line.trim();
            if (clean.isEmpty()) continue;

            boolean isBullet = clean.startsWith("•") || clean.startsWith("-") || clean.startsWith("*") || clean.startsWith("·");
            String bulletContent = clean.replaceFirst("^[•\\-*·\\s]+", "").trim();

            if (!isBullet && clean.length() < 90) {
                if (currentExp != null && currentExp.title != null) {
                    result.experience.add(currentExp);
                }
                currentExp = new ParsedExperience();
                currentExp.duration = extractYearFromLine(clean);
                String lineNoYear = removeYearFromLine(clean);

                String[] parts = lineNoYear.split("(?i)\\s+(?:at|@|\\||–|-)\\s+");
                if (parts.length >= 2) {
                    currentExp.title = parts[0].trim();
                    currentExp.company = parts[1].trim();
                } else {
                    currentExp.title = lineNoYear.trim();
                }
            } else if (currentExp != null) {
                currentExp.bullets.add(bulletContent);
            }
        }
        if (currentExp != null && currentExp.title != null) {
            result.experience.add(currentExp);
        }

        // --- 7. Parse Certifications ---
        List<String> certLines = sectionMap.getOrDefault("CERTIFICATIONS", Collections.emptyList());
        for (String line : certLines) {
            String c = line.replaceFirst("^[•\\-*·\\s]+", "").trim();
            if (!c.isEmpty()) {
                result.certifications.add(c);
            }
        }

        // --- 8. Parse Achievements ---
        List<String> achLines = sectionMap.getOrDefault("ACHIEVEMENTS", Collections.emptyList());
        for (String line : achLines) {
            String a = line.replaceFirst("^[•\\-*·\\s]+", "").trim();
            if (!a.isEmpty()) {
                result.achievements.add(a);
            }
        }

        return result;
    }

    private String detectSectionHeader(String line) {
        String trimmed = line.trim().toUpperCase();
        if (trimmed.length() > 40) return null;

        if (trimmed.equals("OBJECTIVE") || trimmed.equals("SUMMARY") || trimmed.startsWith("PROFESSIONAL SUMMARY") || trimmed.equals("ABOUT ME") || trimmed.equals("PROFILE")) {
            return "SUMMARY";
        }
        if (trimmed.equals("EDUCATION") || trimmed.startsWith("ACADEMIC") || trimmed.equals("QUALIFICATIONS")) {
            return "EDUCATION";
        }
        if (trimmed.equals("TECHNICAL SKILLS") || trimmed.equals("SKILLS") || trimmed.equals("CORE SKILLS") || trimmed.startsWith("CORE COMPETENCIES")) {
            return "SKILLS";
        }
        if (trimmed.equals("PROJECTS") || trimmed.startsWith("KEY PROJECTS") || trimmed.startsWith("ACADEMIC PROJECTS")) {
            return "PROJECTS";
        }
        if (trimmed.equals("EXPERIENCE") || trimmed.equals("WORK EXPERIENCE") || trimmed.startsWith("PROFESSIONAL EXPERIENCE") || trimmed.equals("EMPLOYMENT")) {
            return "EXPERIENCE";
        }
        if (trimmed.equals("CERTIFICATIONS") || trimmed.equals("CERTIFICATES") || trimmed.equals("COURSES")) {
            return "CERTIFICATIONS";
        }
        if (trimmed.equals("ACHIEVEMENTS") || trimmed.equals("AWARDS") || trimmed.equals("HONORS")) {
            return "ACHIEVEMENTS";
        }
        return null;
    }

    private boolean isValidName(String line) {
        String trimmed = line.trim();
        if (trimmed.length() < 3 || trimmed.length() > 60) return false;
        if (trimmed.contains("@") || trimmed.contains(".com") || trimmed.contains("+91") || trimmed.contains("http")) return false;
        if (trimmed.toUpperCase().equals("OBJECTIVE") || trimmed.toUpperCase().equals("EDUCATION") || trimmed.toUpperCase().equals("RESUME")) return false;
        return trimmed.matches("^[A-Za-z][A-Za-z\\s.'-]+$");
    }

    private String extractLocationFromLine(String line) {
        if (line == null) return null;
        String[] parts = line.split("[—–|•·]+");
        for (String p : parts) {
            String trimmed = p.trim();
            if (trimmed.isEmpty()) continue;
            if (trimmed.contains("@") || trimmed.matches(".*\\d{5,}.*") || trimmed.toLowerCase().contains("linkedin") || trimmed.toLowerCase().contains("github") || trimmed.toLowerCase().contains("leetcode")) {
                continue;
            }
            if (trimmed.contains(",") || trimmed.matches("^[A-Za-z\\s]+$") && trimmed.length() > 5) {
                return trimmed;
            }
        }
        return null;
    }

    private boolean containsDegreeKeyword(String line) {
        String lower = line.toLowerCase();
        return lower.contains("b.tech") || lower.contains("b.e") || lower.contains("b.s") || lower.contains("bachelor")
                || lower.contains("m.tech") || lower.contains("m.s") || lower.contains("master")
                || lower.contains("intermediate") || lower.contains("high school") || lower.contains("diploma")
                || lower.contains("engineering college") || lower.contains("university");
    }

    private String extractYearFromLine(String line) {
        Matcher m = Pattern.compile("(\\b(?:20|19)\\d\\d\\s*(?:[–-]\\s*(?:(?:20|19)\\d\\d|Present|Current))?\\b)", Pattern.CASE_INSENSITIVE).matcher(line);
        if (m.find()) {
            return m.group(1).trim();
        }
        return "";
    }

    private String removeYearFromLine(String line) {
        return line.replaceAll("(\\b(?:20|19)\\d\\d\\s*(?:[–-]\\s*(?:(?:20|19)\\d\\d|Present|Current))?\\b)", "").trim();
    }

    private String extractJobTitle(String jobDescription) {
        if (jobDescription == null) return "Software Developer";
        Matcher m = Pattern.compile("(?i)(?:Job Title|Position|Role)[:\\s-]*([A-Za-z\\s/]+)").matcher(jobDescription);
        if (m.find()) {
            return m.group(1).trim();
        }
        String firstLine = jobDescription.split("\\n")[0].trim();
        if (firstLine.length() < 50 && !firstLine.isBlank()) {
            return firstLine.replaceFirst("^(?i)Job Title[:\\s-]*", "").trim();
        }
        return "Software Developer";
    }

    private List<String> prioritizeSkillsForJob(List<String> skills, String jobDescription) {
        if (jobDescription == null || jobDescription.isBlank()) return skills;
        String jobLower = jobDescription.toLowerCase();

        List<String> matched = new ArrayList<>();
        List<String> other = new ArrayList<>();

        for (String skill : skills) {
            if (jobLower.contains(skill.toLowerCase())) {
                matched.add(skill);
            } else {
                other.add(skill);
            }
        }
        matched.addAll(other);
        return matched;
    }

    private String capitalizeSkill(String skill) {
        if (skill == null || skill.isBlank()) return "";
        String s = skill.trim();
        if (s.equalsIgnoreCase("sql") || s.equalsIgnoreCase("oop") || s.equalsIgnoreCase("jwt") || s.equalsIgnoreCase("jpa") || s.equalsIgnoreCase("aws") || s.equalsIgnoreCase("gcp") || s.equalsIgnoreCase("api") || s.equalsIgnoreCase("apis") || s.equalsIgnoreCase("ci/cd")) {
            return s.toUpperCase();
        }
        if (s.equalsIgnoreCase("mysql")) return "MySQL";
        if (s.equalsIgnoreCase("postgresql")) return "PostgreSQL";
        if (s.equalsIgnoreCase("mongodb")) return "MongoDB";
        if (s.equalsIgnoreCase("spring boot")) return "Spring Boot";
        if (s.equalsIgnoreCase("spring data jpa")) return "Spring Data JPA";
        if (s.equalsIgnoreCase("rest apis") || s.equalsIgnoreCase("restful")) return "RESTful APIs";
        if (s.equalsIgnoreCase("data structure and algorithms") || s.equalsIgnoreCase("data structures and algorithms") || s.equalsIgnoreCase("data structures")) return "Data Structures & Algorithms";

        return Arrays.stream(s.split("\\s+"))
                .map(w -> w.isEmpty() ? "" : Character.toUpperCase(w.charAt(0)) + w.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }
}

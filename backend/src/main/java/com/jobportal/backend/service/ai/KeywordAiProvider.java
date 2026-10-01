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

    private static final Pattern DEGREE_PATTERN = Pattern.compile(
        "(?:B\\.?S\\.?|B\\.?A\\.?|M\\.?S\\.?|M\\.?A\\.?|Ph\\.?D\\.?|MBA|Bachelor|Master|Doctorate|Associate)\\s*(?:of|in|'s)?\\s*[A-Za-z\\s,]+",
        Pattern.CASE_INSENSITIVE
    );

    @Override
    public AiResumeAnalysisResult analyzeResume(String resumeText) {
        logger.info("Analyzing resume with keyword-based AI provider ({} characters)", resumeText.length());

        String text = resumeText.trim();
        String textLower = text.toLowerCase();

        // Extract skills by matching known skills against resume text
        List<String> foundSkills = KNOWN_SKILLS.stream()
                .filter(skill -> {
                    String pattern = "\\b" + Pattern.quote(skill) + "\\b";
                    return Pattern.compile(pattern, Pattern.CASE_INSENSITIVE).matcher(text).find();
                })
                .map(this::capitalizeSkill)
                .sorted()
                .collect(Collectors.toList());

        // Extract email
        String email = null;
        Matcher emailMatcher = EMAIL_PATTERN.matcher(text);
        if (emailMatcher.find()) email = emailMatcher.group();

        // Extract phone
        String phone = null;
        Matcher phoneMatcher = PHONE_PATTERN.matcher(text);
        if (phoneMatcher.find()) phone = phoneMatcher.group().trim();

        // Estimate years of experience
        double yearsExp = 0;
        Matcher yearsMatcher = EXPERIENCE_YEARS_PATTERN.matcher(text);
        while (yearsMatcher.find()) {
            double found = Double.parseDouble(yearsMatcher.group(1));
            yearsExp = Math.max(yearsExp, found);
        }

        // Extract name (heuristic: first non-empty line that looks like a name)
        String name = extractName(text);

        // Extract education
        List<AiResumeAnalysisResult.EducationEntry> education = new ArrayList<>();
        Matcher degreeMatcher = DEGREE_PATTERN.matcher(text);
        while (degreeMatcher.find()) {
            education.add(AiResumeAnalysisResult.EducationEntry.builder()
                    .degree(degreeMatcher.group().trim())
                    .build());
        }

        // Extract experience entries (look for patterns like "Title at Company")
        List<AiResumeAnalysisResult.ExperienceEntry> experience = extractExperience(text);

        // Extract certifications
        List<String> certifications = extractSection(text, "certification");

        // Extract projects
        List<String> projects = extractSection(text, "project");

        // Generate summary
        String summary = generateSummary(name, foundSkills, yearsExp, education);

        return AiResumeAnalysisResult.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .skills(foundSkills)
                .education(education)
                .experience(experience)
                .certifications(certifications)
                .projects(projects)
                .technologies(foundSkills) // technologies overlap with skills
                .summary(summary)
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
        return "TAILORED RESUME\n\n" +
                "Summary:\nResults-driven professional with experience tailored to the requirements of the job. " +
                "Proven ability to deliver impactful solutions.\n\n" +
                "Experience:\n" +
                "- Leveraged key skills to achieve strategic objectives.\n" +
                "- Collaborated with cross-functional teams to drive success.\n\n" +
                "Note: This is a mock tailored resume generated by KeywordAiProvider because OpenAI is not configured.";
    }

    @Override
    public String answerCandidateQuestion(String question, String candidateContext,
                                            String jobContext, String matchContext) {
        // Keyword-based RAG: analyze the question and retrieve relevant context
        String qLower = question.toLowerCase();

        if (qLower.contains("match") || qLower.contains("score") || qLower.contains("why")) {
            return "Based on your profile analysis: " + matchContext +
                    "\n\nYour match score is calculated using skill overlap (30%), semantic similarity (40%), " +
                    "experience match (15%), and location compatibility (10%). " +
                    "To improve your score, consider adding missing skills to your profile.";
        }

        if (qLower.contains("skill") || qLower.contains("missing") || qLower.contains("gap")) {
            return "Skill gap analysis from your profile: " + matchContext +
                    "\n\nFocus on the missing skills listed above. Online courses and project-based " +
                    "learning are effective ways to build these competencies.";
        }

        if (qLower.contains("improve") || qLower.contains("resume") || qLower.contains("better")) {
            return "Resume improvement tips based on your profile:\n" +
                    "1. Add quantified achievements with numbers and percentages\n" +
                    "2. Include relevant keywords from the job description\n" +
                    "3. List specific projects that demonstrate required skills\n" +
                    "4. Keep formatting clean and ATS-friendly\n\n" +
                    "Your current profile: " + candidateContext;
        }

        return "Based on your profile and the job requirements:\n\n" +
                "Profile: " + candidateContext + "\n\n" +
                "Job: " + jobContext + "\n\n" +
                "I recommend focusing on aligning your experience with the job requirements " +
                "and highlighting relevant projects and achievements.";
    }

    @Override
    public boolean isAvailable() {
        return true; // Always available as fallback
    }

    @Override
    public String getProviderName() {
        return "KeywordAiProvider (Built-in NLP)";
    }

    // ---- Private helpers ----

    private String capitalizeSkill(String skill) {
        if (skill.length() <= 3 && !skill.contains(".")) return skill.toUpperCase();
        return Arrays.stream(skill.split("\\s+"))
                .map(w -> Character.toUpperCase(w.charAt(0)) + w.substring(1))
                .collect(Collectors.joining(" "));
    }

    private String extractName(String text) {
        String[] lines = text.split("\\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;
            // A name line is typically short, has no special chars, and contains only letters/spaces
            if (trimmed.length() < 60 && trimmed.matches("^[A-Za-z][A-Za-z\\s.'-]+$")
                    && !trimmed.toLowerCase().contains("resume")
                    && !trimmed.toLowerCase().contains("curriculum")) {
                return trimmed;
            }
        }
        return null;
    }

    private List<AiResumeAnalysisResult.ExperienceEntry> extractExperience(String text) {
        List<AiResumeAnalysisResult.ExperienceEntry> entries = new ArrayList<>();
        // Look for patterns like "Software Engineer at Google" or "Senior Developer | Microsoft"
        Pattern titlePattern = Pattern.compile(
                "([A-Z][a-zA-Z\\s]+(?:Engineer|Developer|Manager|Designer|Analyst|Architect|Lead|Intern|Consultant))\\s*(?:at|@|\\||–|-)\\s*([A-Z][a-zA-Z\\s&.]+)",
                Pattern.MULTILINE
        );
        Matcher matcher = titlePattern.matcher(text);
        while (matcher.find() && entries.size() < 5) {
            entries.add(AiResumeAnalysisResult.ExperienceEntry.builder()
                    .title(matcher.group(1).trim())
                    .company(matcher.group(2).trim())
                    .build());
        }
        return entries;
    }

    private List<String> extractSection(String text, String sectionKeyword) {
        List<String> items = new ArrayList<>();
        String[] lines = text.split("\\n");
        boolean inSection = false;
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.toLowerCase().contains(sectionKeyword)) {
                inSection = true;
                continue;
            }
            if (inSection) {
                if (trimmed.isEmpty() || (trimmed.matches("^[A-Z][A-Z\\s]+$") && !trimmed.toLowerCase().contains(sectionKeyword))) {
                    break; // End of section
                }
                if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
                    items.add(trimmed.replaceFirst("^[•\\-*]\\s*", ""));
                } else if (!trimmed.isEmpty()) {
                    items.add(trimmed);
                }
            }
        }
        return items.stream().limit(10).collect(Collectors.toList());
    }

    private String generateSummary(String name, List<String> skills, double yearsExp,
                                     List<AiResumeAnalysisResult.EducationEntry> education) {
        StringBuilder sb = new StringBuilder();
        if (name != null) sb.append(name);
        if (yearsExp > 0) {
            sb.append(sb.length() > 0 ? " — " : "").append(String.format("%.0f", yearsExp)).append("+ years of experience");
        }
        if (!skills.isEmpty()) {
            sb.append(sb.length() > 0 ? ". " : "").append("Key skills: ")
                    .append(String.join(", ", skills.stream().limit(8).toList()));
        }
        if (!education.isEmpty()) {
            sb.append(". Education: ").append(education.get(0).getDegree());
        }
        return sb.toString();
    }

    @Override
    public TailoredResumeResult tailorResumeStructured(String resumeText, String jobDescription) {
        // Best-effort structured extraction from raw text using existing analysis
        AiResumeAnalysisResult analysis = analyzeResume(resumeText != null ? resumeText : "");

        TailoredResumeResult result = new TailoredResumeResult();
        result.setName(analysis.getName());
        result.setEmail(analysis.getEmail());
        result.setPhone(analysis.getPhone());
        result.setSummary(analysis.getSummary());
        result.setSkills(analysis.getSkills());

        // Convert experience entries
        if (analysis.getExperience() != null) {
            result.setExperience(analysis.getExperience().stream().map(exp -> {
                TailoredResumeResult.ExperienceEntry entry = new TailoredResumeResult.ExperienceEntry();
                entry.setTitle(exp.getTitle());
                entry.setCompany(exp.getCompany());
                entry.setDuration(exp.getDuration());
                entry.setBullets(exp.getDescription() != null ? List.of(exp.getDescription()) : List.of());
                return entry;
            }).collect(Collectors.toList()));
        }

        // Convert education entries
        if (analysis.getEducation() != null) {
            result.setEducation(analysis.getEducation().stream().map(edu -> {
                TailoredResumeResult.EducationEntry entry = new TailoredResumeResult.EducationEntry();
                entry.setDegree(edu.getDegree());
                entry.setInstitution(edu.getInstitution());
                entry.setYear(edu.getYear());
                return entry;
            }).collect(Collectors.toList()));
        }

        result.setCertifications(analysis.getCertifications());
        return result;
    }
}

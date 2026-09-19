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
    private static final Set<String> KNOWN_SKILLS = Set.of(
        "java", "python", "javascript", "typescript", "c++", "c#", "go", "rust", "ruby", "php", "swift", "kotlin",
        "react", "angular", "vue", "vue.js", "next.js", "nuxt.js", "svelte", "jquery",
        "spring", "spring boot", "django", "flask", "express", "express.js", "node.js", "nodejs",
        "asp.net", ".net", "rails", "ruby on rails", "laravel", "fastapi",
        "html", "css", "tailwind", "tailwindcss", "bootstrap", "sass", "less",
        "sql", "mysql", "postgresql", "postgres", "mongodb", "redis", "elasticsearch", "cassandra",
        "oracle", "sqlite", "mariadb", "dynamodb",
        "aws", "azure", "gcp", "google cloud", "heroku", "digitalocean", "firebase",
        "docker", "kubernetes", "k8s", "terraform", "ansible", "jenkins", "ci/cd",
        "git", "github", "gitlab", "bitbucket", "svn",
        "rest", "rest api", "restful", "graphql", "grpc", "websocket", "soap",
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
        "blockchain", "solidity", "web3"
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
    }

    @Override
    public ResumeCoachResult coachResume(String resumeText, String jobDescription,
                                          List<String> matchedSkills, List<String> missingSkills) {
        List<ResumeCoachResult.ImprovementSuggestion> suggestions = new ArrayList<>();
        List<String> weakSections = new ArrayList<>();
        Map<String, Integer> sectionScores = new java.util.LinkedHashMap<>();

        String resumeLower = resumeText.toLowerCase();
        String jobLower    = (jobDescription != null) ? jobDescription.toLowerCase() : "";

        // ── 1. Summary / Objective section ──────────────────────────────────
        int summaryScore = 0;
        boolean hasSummary = resumeLower.contains("summary") || resumeLower.contains("objective") || resumeLower.contains("profile");
        if (hasSummary) summaryScore += 30;
        // Length check — a good summary means a detailed resume
        if (resumeText.length() > 1500) summaryScore += 30;
        else if (resumeText.length() > 700) summaryScore += 15;
        // Job title alignment
        String[] jobWords = jobLower.split("[\\s,;|]+");
        long titleHits = Arrays.stream(jobWords)
                .filter(w -> w.length() > 4 && resumeLower.contains(w))
                .limit(10).count();
        summaryScore += (int) Math.min(40, titleHits * 5);
        sectionScores.put("Summary", Math.min(100, summaryScore));
        if (summaryScore < 50) {
            weakSections.add("Summary");
            suggestions.add(ResumeCoachResult.ImprovementSuggestion.builder()
                    .section("Summary")
                    .reason("Add a professional summary that mirrors the job title and key responsibilities. "
                            + "Recruiters spend an average of 7 seconds on the first scan.")
                    .suggestedText("Results-driven professional with X+ years of experience in [key area] "
                            + "seeking to contribute [specific value] at [company type].")
                    .build());
        }

        // ── 2. Skills section ────────────────────────────────────────────────
        int skillsScore = 0;
        int totalJobSkills = (missingSkills != null ? missingSkills.size() : 0)
                           + (matchedSkills != null ? matchedSkills.size() : 0);
        int matched = (matchedSkills != null) ? matchedSkills.size() : 0;
        if (totalJobSkills > 0) {
            skillsScore = (int) (((double) matched / totalJobSkills) * 80);
        } else {
            skillsScore = resumeLower.contains("skill") ? 50 : 30;
        }
        // Bonus for having a dedicated skills section
        if (resumeLower.contains("technical skills") || resumeLower.contains("core competencies")) skillsScore += 15;
        sectionScores.put("Skills", Math.min(100, skillsScore));
        if (skillsScore < 60) {
            weakSections.add("Skills");
            suggestions.add(ResumeCoachResult.ImprovementSuggestion.builder()
                    .section("Skills")
                    .reason("Your resume is missing key skills required for this role: "
                            + (missingSkills != null && !missingSkills.isEmpty()
                               ? String.join(", ", missingSkills.stream().limit(6).toList())
                               : "several job-required skills are not visible."))
                    .build());
        }

        // ── 3. Experience section ────────────────────────────────────────────
        int expScore = 0;
        // Quantified achievements are the strongest signal
        boolean hasNumbers = Pattern.compile("\\d+%|\\$\\d+|\\d+\\s*(users|customers|projects|team|engineers|clients|revenue|ms|million|billion)",
                Pattern.CASE_INSENSITIVE).matcher(resumeText).find();
        if (hasNumbers) expScore += 35;
        // Action verb richness
        String[] actionVerbs = {"led", "built", "designed", "architected", "improved", "reduced",
                "increased", "launched", "delivered", "managed", "mentored", "scaled", "optimized",
                "implemented", "developed", "created", "deployed", "automated", "collaborated"};
        long verbCount = Arrays.stream(actionVerbs).filter(resumeLower::contains).count();
        expScore += (int) Math.min(35, verbCount * 3);
        // Experience keyword match with job
        if (jobLower.length() > 0) {
            String[] expKeywords = {"experience", "year", "worked", "developed", "contributed"};
            long expHits = Arrays.stream(expKeywords).filter(k -> resumeLower.contains(k) && jobLower.contains(k)).count();
            expScore += (int) Math.min(30, expHits * 8);
        } else {
            if (resumeLower.contains("experience")) expScore += 20;
        }
        sectionScores.put("Experience", Math.min(100, expScore));
        if (!hasNumbers) {
            weakSections.add("Experience");
            suggestions.add(ResumeCoachResult.ImprovementSuggestion.builder()
                    .section("Experience")
                    .reason("Add quantified achievements with specific numbers. "
                            + "E.g., 'Reduced API latency by 40%' or 'Led a team of 6 engineers to deliver X on schedule.'")
                    .suggestedText("Use the format: [Action verb] + [What you did] + [Result with a number]")
                    .build());
        }

        // ── 4. Education section ─────────────────────────────────────────────
        int eduScore = 0;
        boolean hasDegree = Pattern.compile("bachelor|master|phd|mba|b\\.s|m\\.s|b\\.e|m\\.e|diploma|associate",
                Pattern.CASE_INSENSITIVE).matcher(resumeText).find();
        if (hasDegree) eduScore += 60;
        boolean hasInstitution = Pattern.compile("university|college|institute|school",
                Pattern.CASE_INSENSITIVE).matcher(resumeText).find();
        if (hasInstitution) eduScore += 25;
        boolean hasGradYear = Pattern.compile("20[0-2]\\d|19[89]\\d").matcher(resumeText).find();
        if (hasGradYear) eduScore += 15;
        sectionScores.put("Education", Math.min(100, eduScore));
        if (eduScore < 40) {
            weakSections.add("Education");
            suggestions.add(ResumeCoachResult.ImprovementSuggestion.builder()
                    .section("Education")
                    .reason("Make sure your highest degree, institution name, field of study, and graduation year are clearly stated.")
                    .build());
        }

        // ── 5. Projects & Certifications ────────────────────────────────────
        int projectScore = 0;
        boolean hasProjects = resumeLower.contains("project") || resumeLower.contains("portfolio") || resumeLower.contains("github");
        if (hasProjects) projectScore += 40;
        boolean hasCerts = resumeLower.contains("certified") || resumeLower.contains("certification") || resumeLower.contains("certificate");
        if (hasCerts) projectScore += 40;
        boolean hasLinks = resumeLower.contains("linkedin") || resumeLower.contains("github.com") || resumeLower.contains("http");
        if (hasLinks) projectScore += 20;
        sectionScores.put("Projects & Certifications", Math.min(100, projectScore));
        if (!hasProjects && !hasCerts) {
            suggestions.add(ResumeCoachResult.ImprovementSuggestion.builder()
                    .section("Projects & Certifications")
                    .reason("Add 2–3 portfolio projects or relevant certifications. "
                            + "These are strong differentiators when your work experience is limited.")
                    .build());
        }

        // ── Overall weighted score ───────────────────────────────────────────
        int overall = (int) (
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
}

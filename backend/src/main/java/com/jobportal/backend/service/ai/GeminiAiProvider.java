package com.jobportal.backend.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@org.springframework.context.annotation.Primary
@ConditionalOnProperty(name = "talentsync.ai.provider", havingValue = "gemini")
public class GeminiAiProvider implements AiProvider {
    private static final Logger logger = LoggerFactory.getLogger(GeminiAiProvider.class);

    private final RestClient client;
    private final ObjectMapper objectMapper;
    private final KeywordAiProvider fallback;
    private final String baseUrl;

    @Value("${talentsync.ai.api-key:}")
    private String apiKey;

    @Value("${talentsync.ai.model:gemini-1.5-flash}")
    private String model;

    public GeminiAiProvider(
            @Value("${talentsync.ai.base-url:https://generativelanguage.googleapis.com/v1beta/models/}") String baseUrl,
            ObjectMapper objectMapper,
            KeywordAiProvider fallback) {
        this.baseUrl = baseUrl;
        this.client = RestClient.builder().build();
        this.objectMapper = objectMapper;
        this.fallback = fallback;
    }

    @Override
    public AiResumeAnalysisResult analyzeResume(String resumeText) {
        try {
            String json = requestText("Extract resume information. Return ONLY a valid JSON object matching this schema: " +
                    "{ \"name\": \"\", \"email\": \"\", \"phone\": \"\", \"skills\": [], \"education\": [{\"degree\": \"\", \"institution\": \"\", \"year\": \"\"}], \"experience\": [{\"title\": \"\", \"company\": \"\", \"years\": 0}], \"certifications\": [], \"projects\": [], \"technologies\": [], \"summary\": \"\", \"estimatedYearsOfExperience\": 0 }",
                    resumeText);
            
            json = extractJson(json);
            AiResumeAnalysisResult result = objectMapper.readValue(json, AiResumeAnalysisResult.class);
            validateAnalysis(result);
            return result;
        } catch (Exception ex) {
            logger.warn("Gemini analysis failed: {}", ex.getMessage());
            return fallback.analyzeResume(resumeText);
        }
    }

    @Override
    public List<String> generateInterviewQuestions(String resumeText, String jobDescription, List<String> requiredSkills) {
        try {
            String json = requestText("Generate 5 tailored interview questions based on the resume and job description. Return ONLY a JSON array of strings: [\"q1\", \"q2\"]. No markdown.",
                    "Resume: " + safeText(resumeText) + "\nJob: " + safeText(jobDescription));
            
            json = extractJson(json);
            return objectMapper.readValue(json, objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (Exception ex) {
            logger.warn("Gemini questions unavailable: {}", ex.getMessage());
            return fallback.generateInterviewQuestions(resumeText, jobDescription, requiredSkills);
        }
    }

    @Override
    public ResumeCoachResult coachResume(String resumeText, String jobDescription, List<String> matchedSkills, List<String> missingSkills) {
        try {
            // Build context about skill matching for the AI
            StringBuilder contextBuilder = new StringBuilder();
            contextBuilder.append("Resume:\n").append(safeText(resumeText)).append("\n\n");

            boolean hasJob = jobDescription != null && !jobDescription.isBlank();
            if (hasJob) {
                contextBuilder.append("Job Description:\n").append(jobDescription).append("\n\n");
            }
            if (matchedSkills != null && !matchedSkills.isEmpty()) {
                contextBuilder.append("Skills found in resume that match the job: ")
                        .append(String.join(", ", matchedSkills)).append("\n");
            }
            if (missingSkills != null && !missingSkills.isEmpty()) {
                contextBuilder.append("Skills required by the job but MISSING from resume: ")
                        .append(String.join(", ", missingSkills)).append("\n");
            }

            String reviewMode = hasJob
                    ? "Analyze how well this resume matches the given job description."
                    : "Analyze this resume's overall quality and professional strength.";

            String systemPrompt = reviewMode + "\n\n" +
                    "SCORING RUBRIC — score each section 0 to 100:\n" +
                    "- Summary (15% weight): Does the resume have a clear, compelling professional summary? " +
                    "Does it align with the job if one is provided?\n" +
                    "- Skills (30% weight): How many relevant skills are present? " +
                    (hasJob ? "Use the matched/missing skills provided." : "Is there a dedicated skills section with concrete technologies?") + "\n" +
                    "- Experience (35% weight): Are there quantified achievements (numbers, percentages, metrics)? " +
                    "Are action verbs used? Is the experience relevant to the job?\n" +
                    "- Education (12% weight): Is the degree, institution, and graduation year clearly stated?\n" +
                    "- Projects & Certifications (8% weight): Are there portfolio projects, certifications, or links?\n\n" +
                    "Calculate resumeScore as the weighted average: " +
                    "Summary×0.15 + Skills×0.30 + Experience×0.35 + Education×0.12 + Projects×0.08\n\n" +
                    "Return ONLY a valid JSON object (no markdown, no code blocks) matching this EXACT schema:\n" +
                    "{\n" +
                    "  \"resumeScore\": <weighted average 0-100>,\n" +
                    "  \"sectionScores\": {\n" +
                    "    \"Summary\": <0-100>,\n" +
                    "    \"Skills\": <0-100>,\n" +
                    "    \"Experience\": <0-100>,\n" +
                    "    \"Education\": <0-100>,\n" +
                    "    \"Projects & Certifications\": <0-100>\n" +
                    "  },\n" +
                    "  \"missingKeywords\": [\"keyword1\", \"keyword2\"],\n" +
                    "  \"weakSections\": [\"section names scoring below 60\"],\n" +
                    "  \"suggestions\": [\n" +
                    "    {\n" +
                    "      \"section\": \"Section Name\",\n" +
                    "      \"reason\": \"Specific explanation of what's wrong\",\n" +
                    "      \"suggestedText\": \"Concrete rewrite or example text\"\n" +
                    "    }\n" +
                    "  ]\n" +
                    "}\n\n" +
                    "IMPORTANT RULES:\n" +
                    "- Provide 3 to 5 specific, actionable suggestions with concrete suggestedText rewrites.\n" +
                    "- missingKeywords should list exact skills/keywords absent from the resume" +
                    (hasJob ? " but required by the job." : " that would strengthen the resume.") + "\n" +
                    "- Be honest but constructive. A typical good resume scores 60-75. Only exceptional resumes score 80+.\n" +
                    "- Score sections independently — a great experience section can coexist with a weak summary.";

            String json = requestText(systemPrompt, contextBuilder.toString());
            json = extractJson(json);

            ResumeCoachResult result = objectMapper.readValue(json, ResumeCoachResult.class);
            // Clamp scores to valid range
            result.setResumeScore(Math.max(0, Math.min(100, result.getResumeScore())));
            if (result.getSectionScores() != null) {
                result.getSectionScores().replaceAll((k, v) -> Math.max(0, Math.min(100, v)));
            }
            return result;
        } catch (Exception ex) {
            logger.warn("Gemini coach failed ({}), using keyword fallback", ex.getMessage());
            return fallback.coachResume(resumeText, jobDescription, matchedSkills, missingSkills);
        }
    }

    @Override
    public String answerCandidateQuestion(String question, String candidateContext, String jobContext, String matchContext) {
        try {
            return requestText("You are an evidence-based career assistant. Answer the user's question concisely based on their profile and the job context.",
                    "Question: " + question + "\nCandidate: " + safeText(candidateContext) + "\nJob: " + safeText(jobContext) + "\nMatch: " + safeText(matchContext));
        } catch (Exception ex) {
            logger.warn("Gemini career assistant unavailable: {}", ex.getMessage());
            return fallback.answerCandidateQuestion(question, candidateContext, jobContext, matchContext);
        }
    }

    @Override
    public String tailorResume(String resumeText, String jobDescription) {
        if (!isAvailable()) return fallback.tailorResume(resumeText, jobDescription);
        try {
            return requestText("Tailor this resume to match the job description. Rewrite the summary and experience bullets to strongly align with the job description. Do not fabricate experience. Format as clean text.",
                    "Original Resume: " + safeText(resumeText) + "\n\nJob Description: " + safeText(jobDescription));
        } catch (Exception ex) {
            logger.warn("Gemini tailor unavailable: {}", ex.getMessage());
            return fallback.tailorResume(resumeText, jobDescription);
        }
    }

    @Override
    public TailoredResumeResult tailorResumeStructured(String resumeText, String jobDescription) {
        if (!isAvailable()) return fallback.tailorResumeStructured(resumeText, jobDescription);
        try {
            String json = requestText(
                "You are an elite executive resume writer and ATS optimization specialist. " +
                "Carefully analyze the candidate's original resume against the target job description. " +
                "Tailor the resume to showcase maximum relevance for the job while preserving factual accuracy (never invent employers or degrees). " +
                "Key tailoring rules:\n" +
                "1. Summary: Craft a compelling 3-4 sentence professional summary emphasizing relevant years of experience, core technical specialties, and alignment with the job goals.\n" +
                "2. Skills: Reorder and group relevant technical and professional skills matching the job keywords.\n" +
                "3. Experience: Rewrite bullet points using Google/XYZ format (Accomplished [X] as measured by [Y], by doing [Z]). Start with strong active verbs, highlight technical stack, and emphasize quantifiable impact.\n" +
                "4. Section Improvements: Provide a clear breakdown explaining why each section was improved and the key optimizations made.\n\n" +
                "Return ONLY a valid JSON object matching this exact schema:\n" +
                "{\n" +
                "  \"name\": \"Candidate Full Name\",\n" +
                "  \"email\": \"email@example.com\",\n" +
                "  \"phone\": \"+1234567890\",\n" +
                "  \"location\": \"City, State\",\n" +
                "  \"summary\": \"Compelling professional summary tailored to target role...\",\n" +
                "  \"skills\": [\"Skill1\", \"Skill2\", \"Skill3\"],\n" +
                "  \"experience\": [\n" +
                "    {\n" +
                "      \"title\": \"Job Title\",\n" +
                "      \"company\": \"Company Name\",\n" +
                "      \"duration\": \"Month Year - Present\",\n" +
                "      \"bullets\": [\"Action verb + impact-focused achievement...\", \"Another bullet...\"]\n" +
                "    }\n" +
                "  ],\n" +
                "  \"education\": [\n" +
                "    { \"degree\": \"Degree Name\", \"institution\": \"University Name\", \"year\": \"Graduation Year\" }\n" +
                "  ],\n" +
                "  \"certifications\": [\"Certification Name\"],\n" +
                "  \"projects\": [\n" +
                "    { \"name\": \"Project Title\", \"description\": \"Impact & architecture description\", \"technologies\": [\"Tech1\", \"Tech2\"] }\n" +
                "  ],\n" +
                "  \"sectionImprovements\": [\n" +
                "    {\n" +
                "      \"section\": \"Professional Summary\",\n" +
                "      \"whyImproved\": \"Why this section needed changes for the target role\",\n" +
                "      \"keyChanges\": \"Key keywords and strengths added\"\n" +
                "    },\n" +
                "    {\n" +
                "      \"section\": \"Work Experience\",\n" +
                "      \"whyImproved\": \"Aligned bullet points with job responsibilities\",\n" +
                "      \"keyChanges\": \"Enhanced metrics, active verbs, and relevant technologies\"\n" +
                "    },\n" +
                "    {\n" +
                "      \"section\": \"Key Skills\",\n" +
                "      \"whyImproved\": \"Prioritized high-match keywords from job description\",\n" +
                "      \"keyChanges\": \"Grouped and emphasized required core proficiencies\"\n" +
                "    }\n" +
                "  ]\n" +
                "}",
                "Original Resume:\n" + safeText(resumeText) + "\n\nTarget Job Description:\n" + safeText(jobDescription));

            json = extractJson(json);
            return objectMapper.readValue(json, TailoredResumeResult.class);
        } catch (Exception ex) {
            logger.warn("Gemini structured tailor failed: {}", ex.getMessage());
            return fallback.tailorResumeStructured(resumeText, jobDescription);
        }
    }

    private String extractJson(String raw) {
        if (raw == null) return "{}";
        String trimmed = raw.trim();
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf('\n');
            if (firstNewline > 0) {
                trimmed = trimmed.substring(firstNewline + 1);
            }
            if (trimmed.endsWith("```")) {
                trimmed = trimmed.substring(0, trimmed.length() - 3);
            }
        }
        trimmed = trimmed.trim();
        int firstBrace = trimmed.indexOf('{');
        int firstBracket = trimmed.indexOf('[');
        int lastBrace = trimmed.lastIndexOf('}');
        int lastBracket = trimmed.lastIndexOf(']');

        if (firstBrace != -1 && (firstBracket == -1 || firstBrace < firstBracket) && lastBrace > firstBrace) {
            return trimmed.substring(firstBrace, lastBrace + 1);
        } else if (firstBracket != -1 && lastBracket > firstBracket) {
            return trimmed.substring(firstBracket, lastBracket + 1);
        }
        return trimmed;
    }

    @Override
    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank()
                && !apiKey.equalsIgnoreCase("mock_key")
                && !apiKey.contains("YOUR_GEMINI_API_KEY_HERE")
                && !apiKey.contains("YOUR_");
    }

    @Override
    public String getProviderName() {
        return isAvailable() ? "Gemini API (" + model + ")" : "KeywordAiProvider (fallback)";
    }

    private String requestText(String systemInstruction, String input) {
        if (!isAvailable()) throw new IllegalStateException("AI_API_KEY is not configured");

        Map<String, Object> body = Map.of(
                "systemInstruction", Map.of(
                        "parts", List.of(Map.of("text", systemInstruction))
                ),
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", limit(input))))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.1
                )
        );

        String fullUrl = baseUrl + model + ":generateContent?key=" + apiKey;

        JsonNode response = client.post()
                .uri(fullUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(JsonNode.class);

        JsonNode content = response == null ? null : response.at("/candidates/0/content/parts/0/text");
        if (content == null || content.isMissingNode() || content.asText().isBlank()) {
            throw new IllegalStateException("AI response did not contain content");
        }
        return content.asText().trim();
    }

    private void validateAnalysis(AiResumeAnalysisResult result) {
        if (result == null) throw new IllegalArgumentException("Empty AI analysis");
        if (result.getSkills() == null) result.setSkills(new ArrayList<>());
        if (result.getSkills().size() > 100) throw new IllegalArgumentException("AI returned too many skills");
        result.setEstimatedYearsOfExperience(Math.max(0, Math.min(70, result.getEstimatedYearsOfExperience())));
    }

    private String limit(String value) {
        String text = safeText(value);
        return text.length() > 30000 ? text.substring(0, 30000) : text;
    }

    private String safeText(String value) { return value == null ? "" : value; }
}

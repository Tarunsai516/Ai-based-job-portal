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

/** OpenAI-compatible provider. Deterministic extraction remains the fallback. */
@Component
@org.springframework.context.annotation.Primary
@ConditionalOnProperty(name = "talentsync.ai.provider", havingValue = "openai")
public class OpenAiProvider implements AiProvider {
    private static final Logger logger = LoggerFactory.getLogger(OpenAiProvider.class);

    private final RestClient client;
    private final ObjectMapper objectMapper;
    private final KeywordAiProvider fallback;

    @Value("${talentsync.ai.api-key:}")
    private String apiKey;

    @Value("${talentsync.ai.model:gpt-4o-mini}")
    private String model;

    @Value("${talentsync.ai.timeout-ms:10000}")
    private int timeoutMs;

    public OpenAiProvider(
            @Value("${talentsync.ai.base-url:https://api.openai.com/v1}") String baseUrl,
            ObjectMapper objectMapper,
            KeywordAiProvider fallback) {
        this.client = RestClient.builder().baseUrl(baseUrl).build();
        this.objectMapper = objectMapper;
        this.fallback = fallback;
    }

    @Override
    public AiResumeAnalysisResult analyzeResume(String resumeText) {
        try {
            String json = requestJson("Extract resume information", """
                    {
                      "name": null,
                      "email": null,
                      "phone": null,
                      "skills": [],
                      "education": [{"degree":"", "institution":"", "year":""}],
                      "experience": [{"title":"", "company":"", "duration":"", "description":""}],
                      "certifications": [],
                      "projects": [],
                      "technologies": [],
                      "summary": "",
                      "estimatedYearsOfExperience": 0
                    }
                    """, resumeText);
            AiResumeAnalysisResult result = objectMapper.readValue(json, AiResumeAnalysisResult.class);
            validateAnalysis(result);
            return result;
        } catch (Exception ex) {
            logger.warn("OpenAI resume analysis unavailable; using deterministic fallback: {}", ex.getMessage());
            return fallback.analyzeResume(safeText(resumeText));
        }
    }

    @Override
    public ResumeCoachResult coachResume(String resumeText, String jobDescription,
                                         List<String> matchedSkills, List<String> missingSkills) {
        try {
            String systemPrompt = "You are TalentSync AI, an expert resume coach and recruiter. "
                    + "Analyze the resume against the job description. "
                    + "Score each section independently from 0-100 based on how well the resume content "
                    + "matches the specific job requirements. Different resumes will have genuinely different scores. "
                    + "Be accurate, evidence-based, and strict: do NOT round all scores to similar values. "
                    + "Return ONLY the JSON object, no extra text.";

            String schema = """
                    {
                      "resumeScore": 0,
                      "sectionScores": {
                        "Summary": 0,
                        "Skills": 0,
                        "Experience": 0,
                        "Education": 0,
                        "Projects & Certifications": 0
                      },
                      "missingKeywords": [],
                      "weakSections": [],
                      "suggestions": [{
                        "section": "",
                        "currentText": "",
                        "suggestedText": "",
                        "reason": ""
                      }]
                    }
                    """;

            String userInput = "RESUME:\n" + safeText(resumeText)
                    + "\n\nJOB DESCRIPTION:\n" + safeText(jobDescription)
                    + "\n\nMatched skills (already in resume): " + safeList(matchedSkills)
                    + "\nMissing skills (NOT in resume but required by job): " + safeList(missingSkills)
                    + "\n\nInstructions:\n"
                    + "1. resumeScore = weighted average: Skills(30%) + Experience(35%) + Summary(15%) + Education(12%) + Projects(8%)\n"
                    + "2. sectionScores: score each section 0-100 based on how well THIS specific resume matches THIS specific job\n"
                    + "3. missingKeywords: list exact keywords from the job description absent from the resume\n"
                    + "4. weakSections: section names that scored below 60\n"
                    + "5. suggestions: provide 3-5 specific, actionable improvements with suggestedText rewrites where possible";

            String json = request(systemPrompt, schema, userInput, true);
            ResumeCoachResult result = objectMapper.readValue(json, ResumeCoachResult.class);
            result.setResumeScore(Math.max(0, Math.min(100, result.getResumeScore())));
            // Clamp section scores
            if (result.getSectionScores() != null) {
                result.getSectionScores().replaceAll((k, v) -> Math.max(0, Math.min(100, v)));
            }
            return result;
        } catch (Exception ex) {
            logger.warn("OpenAI resume review unavailable; using deterministic fallback: {}", ex.getMessage());
            return fallback.coachResume(safeText(resumeText), safeText(jobDescription), matchedSkills, missingSkills);
        }
    }

    @Override
    public List<String> generateInterviewQuestions(String resumeText, String jobDescription, List<String> requiredSkills) {
        try {
                String json = request("Generate interview questions", "[\"question 1\", \"question 2\"]",
                    "Resume:\n" + safeText(resumeText) + "\nJob:\n" + safeText(jobDescription)
                        + "\nRequired skills: " + safeList(requiredSkills), false);
            List<String> questions = objectMapper.readValue(json,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
            return questions.stream().filter(q -> q != null && !q.isBlank()).limit(10).toList();
        } catch (Exception ex) {
            logger.warn("OpenAI interview generation unavailable; using deterministic fallback: {}", ex.getMessage());
            return fallback.generateInterviewQuestions(resumeText, jobDescription, requiredSkills);
        }
    }

    @Override
    public String answerCandidateQuestion(String question, String candidateContext,
                                          String jobContext, String matchContext) {
        try {
            return requestText("Answer a candidate career question", "Question: " + safeText(question)
                    + "\nCandidate: " + safeText(candidateContext) + "\nJob: " + safeText(jobContext)
                    + "\nMatch: " + safeText(matchContext));
        } catch (Exception ex) {
            logger.warn("OpenAI career assistant unavailable; using deterministic fallback: {}", ex.getMessage());
            return fallback.answerCandidateQuestion(question, candidateContext, jobContext, matchContext);
        }
    }

    @Override
    public String tailorResume(String resumeText, String jobDescription) {
        if (!isAvailable()) return fallback.tailorResume(resumeText, jobDescription);
        try {
            return requestText("Tailor this resume to match the job description.", 
                    "Rewrite the summary and experience bullets to strongly align with the job description. Do not fabricate experience. Format as clean text.\n\n"
                    + "Original Resume: " + safeText(resumeText) + "\n\n"
                    + "Job Description: " + safeText(jobDescription));
        } catch (Exception ex) {
            logger.warn("OpenAI tailor unavailable; using fallback: {}", ex.getMessage());
            return fallback.tailorResume(resumeText, jobDescription);
        }
    }

    @Override
    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank() && !apiKey.equalsIgnoreCase("mock_key");
    }

    @Override
    public String getProviderName() {
        return isAvailable() ? "OpenAI " + model : "KeywordAiProvider (fallback)";
    }

    @Override
    public TailoredResumeResult tailorResumeStructured(String resumeText, String jobDescription) {
        if (!isAvailable()) return fallback.tailorResumeStructured(resumeText, jobDescription);
        try {
            String schema = "{ \"name\": \"\", \"email\": \"\", \"phone\": \"\", \"location\": \"\", \"summary\": \"\", " +
                    "\"skills\": [], \"experience\": [{ \"title\": \"\", \"company\": \"\", \"duration\": \"\", \"bullets\": [] }], " +
                    "\"education\": [{ \"degree\": \"\", \"institution\": \"\", \"year\": \"\" }], " +
                    "\"certifications\": [], \"projects\": [{ \"name\": \"\", \"description\": \"\", \"technologies\": [] }] }";
            String json = requestJson(
                    "Tailor this resume for the job description. Rewrite summary and bullets to align with the job. Do NOT fabricate experience.",
                    "Return ONLY a JSON object matching: " + schema,
                    "Original Resume:\n" + safeText(resumeText) + "\n\nJob Description:\n" + safeText(jobDescription));
            return objectMapper.readValue(json, TailoredResumeResult.class);
        } catch (Exception ex) {
            logger.warn("OpenAI structured tailor failed: {}", ex.getMessage());
            return fallback.tailorResumeStructured(resumeText, jobDescription);
        }
    }

    private String requestJson(String task, String schema, String input) {
        return request(task, schema, input, true);
    }

    private String requestText(String task, String input) {
        return request(task, "Return concise plain text.", input, false);
    }

    private String request(String task, String format, String input, boolean json) {
        if (!isAvailable()) throw new IllegalStateException("AI_API_KEY is not configured");
        Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("model", model);
        body.put("temperature", 0.1);
        body.put("messages", List.of(
                Map.of("role", "system", "content", "You are TalentSync AI, an evidence-based career assistant. "
                        + "Never invent qualifications, skills, employers, or experience. " + task + " Output only the requested format."),
                Map.of("role", "user", "content", format + "\n\nInput:\n" + limit(input))));
        if (json) body.put("response_format", Map.of("type", "json_object"));

        JsonNode response = client.post()
                .uri("/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + apiKey)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
        JsonNode content = response == null ? null : response.at("/choices/0/message/content");
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
    private String safeList(List<String> values) { return values == null ? "[]" : values.toString(); }
}
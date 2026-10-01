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
            String json = requestText("Extract resume information. Return ONLY a valid JSON object matching this schema, no markdown blocks: " +
                    "{ \"name\": \"\", \"email\": \"\", \"phone\": \"\", \"skills\": [], \"education\": [{\"degree\": \"\", \"institution\": \"\", \"year\": \"\"}], \"experience\": [{\"title\": \"\", \"company\": \"\", \"years\": 0}], \"certifications\": [], \"projects\": [], \"technologies\": [], \"summary\": \"\", \"estimatedYearsOfExperience\": 0 }",
                    resumeText);
            
            // Clean markdown blocks if Gemini returns them
            if (json.startsWith("```json")) {
                json = json.substring(7);
                if (json.endsWith("```")) {
                    json = json.substring(0, json.length() - 3);
                }
            }
            json = json.trim();

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
            
            if (json.startsWith("```json")) {
                json = json.substring(7);
                if (json.endsWith("```")) {
                    json = json.substring(0, json.length() - 3);
                }
            }
            json = json.trim();

            return objectMapper.readValue(json, objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (Exception ex) {
            logger.warn("Gemini questions unavailable: {}", ex.getMessage());
            return fallback.generateInterviewQuestions(resumeText, jobDescription, requiredSkills);
        }
    }

    @Override
    public ResumeCoachResult coachResume(String resumeText, String jobDescription, List<String> matchedSkills, List<String> missingSkills) {
        try {
            String json = requestText("Analyze the resume against the job description. Return ONLY a JSON object matching: { \"overallScore\": 0-100, \"sectionScores\": {\"Skills\": 0, \"Experience\": 0}, \"weakSections\": [], \"suggestions\": [{\"section\": \"\", \"reason\": \"\", \"suggestedText\": \"\"}] }",
                    "Resume: " + safeText(resumeText) + "\nJob: " + safeText(jobDescription));
            
            if (json.startsWith("```json")) {
                json = json.substring(7);
                if (json.endsWith("```")) {
                    json = json.substring(0, json.length() - 3);
                }
            }
            json = json.trim();

            return objectMapper.readValue(json, ResumeCoachResult.class);
        } catch (Exception ex) {
            logger.warn("Gemini coach unavailable: {}", ex.getMessage());
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
                "Tailor this resume for the given job description. Rewrite the summary and experience bullets " +
                "to strongly align with the job. Do NOT fabricate experience or skills the candidate does not have. " +
                "Return ONLY a valid JSON object (no markdown code blocks) matching this exact schema:\n" +
                "{\n" +
                "  \"name\": \"Candidate Full Name\",\n" +
                "  \"email\": \"email@example.com\",\n" +
                "  \"phone\": \"+1234567890\",\n" +
                "  \"location\": \"City, State\",\n" +
                "  \"summary\": \"A concise 2-3 sentence professional summary tailored to the job\",\n" +
                "  \"skills\": [\"Skill1\", \"Skill2\"],\n" +
                "  \"experience\": [\n" +
                "    {\n" +
                "      \"title\": \"Job Title\",\n" +
                "      \"company\": \"Company Name\",\n" +
                "      \"duration\": \"Jan 2020 - Present\",\n" +
                "      \"bullets\": [\"Achievement-focused bullet point tailored to the job\", \"Another bullet\"]\n" +
                "    }\n" +
                "  ],\n" +
                "  \"education\": [\n" +
                "    { \"degree\": \"B.S. Computer Science\", \"institution\": \"University\", \"year\": \"2020\" }\n" +
                "  ],\n" +
                "  \"certifications\": [\"Cert Name\"],\n" +
                "  \"projects\": [\n" +
                "    { \"name\": \"Project\", \"description\": \"What it does\", \"technologies\": [\"Tech1\"] }\n" +
                "  ]\n" +
                "}",
                "Original Resume:\n" + safeText(resumeText) + "\n\nJob Description:\n" + safeText(jobDescription));

            // Clean markdown blocks if Gemini returns them
            if (json.startsWith("```json")) {
                json = json.substring(7);
                if (json.endsWith("```")) {
                    json = json.substring(0, json.length() - 3);
                }
            }
            json = json.trim();

            return objectMapper.readValue(json, TailoredResumeResult.class);
        } catch (Exception ex) {
            logger.warn("Gemini structured tailor failed: {}", ex.getMessage());
            return fallback.tailorResumeStructured(resumeText, jobDescription);
        }
    }

    @Override
    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank() && !apiKey.equalsIgnoreCase("mock_key");
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

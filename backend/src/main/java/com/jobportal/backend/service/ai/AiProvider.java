package com.jobportal.backend.service.ai;

import java.util.List;

/**
 * Interface for AI/LLM provider. Implementations can use OpenAI, local models,
 * or a keyword-based mock for development without external API keys.
 */
public interface AiProvider {

    /**
     * Analyze resume text and return structured information.
     */
    AiResumeAnalysisResult analyzeResume(String resumeText);

    /**
     * Generate interview questions based on a candidate's resume and target job description.
     */
    List<String> generateInterviewQuestions(String resumeText, String jobDescription, List<String> requiredSkills);

    /**
     * Generate resume improvement suggestions for a target job.
     */
    ResumeCoachResult coachResume(String resumeText, String jobDescription, List<String> matchedSkills, List<String> missingSkills);

    /**
     * Answer a candidate's question using their profile, resume, and job context (Job Copilot / RAG).
     */
    String answerCandidateQuestion(String question, String candidateContext, String jobContext, String matchContext);

    /**
     * Check if this provider is available/configured.
     */
    boolean isAvailable();

    /**
     * Get provider name for logging.
     */
    String getProviderName();
}

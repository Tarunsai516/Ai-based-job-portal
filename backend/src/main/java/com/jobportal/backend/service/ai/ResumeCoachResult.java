package com.jobportal.backend.service.ai;

import java.util.List;
import java.util.Map;

/**
 * Result of resume coaching / improvement analysis.
 * Now includes per-section scores so the frontend can show a granular
 * breakdown (e.g. Summary: 45/100, Skills: 80/100, Experience: 55/100).
 */
public class ResumeCoachResult {
    private int resumeScore;
    private List<String> missingKeywords;
    private List<String> weakSections;
    private List<ImprovementSuggestion> suggestions;
    /** Per-section scores (section name → 0-100).  E.g. {"Summary": 45, "Skills": 80} */
    private Map<String, Integer> sectionScores;

    public ResumeCoachResult() {}

    public ResumeCoachResult(int resumeScore, List<String> missingKeywords,
                             List<String> weakSections, List<ImprovementSuggestion> suggestions,
                             Map<String, Integer> sectionScores) {
        this.resumeScore = resumeScore;
        this.missingKeywords = missingKeywords;
        this.weakSections = weakSections;
        this.suggestions = suggestions;
        this.sectionScores = sectionScores;
    }

    public int getResumeScore() { return resumeScore; }
    public void setResumeScore(int resumeScore) { this.resumeScore = resumeScore; }

    public List<String> getMissingKeywords() { return missingKeywords; }
    public void setMissingKeywords(List<String> missingKeywords) { this.missingKeywords = missingKeywords; }

    public List<String> getWeakSections() { return weakSections; }
    public void setWeakSections(List<String> weakSections) { this.weakSections = weakSections; }

    public List<ImprovementSuggestion> getSuggestions() { return suggestions; }
    public void setSuggestions(List<ImprovementSuggestion> suggestions) { this.suggestions = suggestions; }

    public Map<String, Integer> getSectionScores() { return sectionScores; }
    public void setSectionScores(Map<String, Integer> sectionScores) { this.sectionScores = sectionScores; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private int resumeScore;
        private List<String> missingKeywords;
        private List<String> weakSections;
        private List<ImprovementSuggestion> suggestions;
        private Map<String, Integer> sectionScores;

        public Builder resumeScore(int resumeScore) { this.resumeScore = resumeScore; return this; }
        public Builder missingKeywords(List<String> missingKeywords) { this.missingKeywords = missingKeywords; return this; }
        public Builder weakSections(List<String> weakSections) { this.weakSections = weakSections; return this; }
        public Builder suggestions(List<ImprovementSuggestion> suggestions) { this.suggestions = suggestions; return this; }
        public Builder sectionScores(Map<String, Integer> sectionScores) { this.sectionScores = sectionScores; return this; }

        public ResumeCoachResult build() {
            return new ResumeCoachResult(resumeScore, missingKeywords, weakSections, suggestions, sectionScores);
        }
    }

    public static class ImprovementSuggestion {
        private String section;
        private String currentText;
        private String suggestedText;
        private String reason;

        public ImprovementSuggestion() {}

        public ImprovementSuggestion(String section, String currentText, String suggestedText, String reason) {
            this.section = section;
            this.currentText = currentText;
            this.suggestedText = suggestedText;
            this.reason = reason;
        }

        public String getSection() { return section; }
        public void setSection(String section) { this.section = section; }

        public String getCurrentText() { return currentText; }
        public void setCurrentText(String currentText) { this.currentText = currentText; }

        public String getSuggestedText() { return suggestedText; }
        public void setSuggestedText(String suggestedText) { this.suggestedText = suggestedText; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }

        public static ImprovementSuggestionBuilder builder() { return new ImprovementSuggestionBuilder(); }

        public static class ImprovementSuggestionBuilder {
            private String section;
            private String currentText;
            private String suggestedText;
            private String reason;

            public ImprovementSuggestionBuilder section(String section) { this.section = section; return this; }
            public ImprovementSuggestionBuilder currentText(String currentText) { this.currentText = currentText; return this; }
            public ImprovementSuggestionBuilder suggestedText(String suggestedText) { this.suggestedText = suggestedText; return this; }
            public ImprovementSuggestionBuilder reason(String reason) { this.reason = reason; return this; }

            public ImprovementSuggestion build() {
                return new ImprovementSuggestion(section, currentText, suggestedText, reason);
            }
        }
    }
}

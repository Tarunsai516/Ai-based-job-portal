# TalentSync Matching Engine

TalentSync uses a deterministic, explainable hybrid matcher. Candidate skills and job skills are normalized through the shared `SkillService`, including aliases such as `SpringBoot` -> `spring boot`, `JS` -> `javascript`, and `Postgres` -> `postgresql`.

## Matching flow

```text
Candidate resume/profile -> normalized candidate profile
Job description/skills   -> normalized job profile
             |                    |
             +-- skill overlap ---+
             +-- semantic keyword overlap
             +-- experience, education, location
                         |
                   weighted score
                         |
              explanation, gaps, learning plan
                         |
                 REST API -> React UI
```

The score is calculated by the backend. AI or resume extraction can support the input pipeline, but it does not choose the final score or make a hiring decision. The current semantic signal is a deterministic keyword fallback, so matching remains available without an external provider.

## Score formula

```text
Overall = Skills * 35%
        + Semantic * 30%
        + Experience * 15%
        + Education * 5%
        + Location * 5%
        + Keywords * 10%
```

Weights are configurable with `WEIGHT_SKILLS`, `WEIGHT_SEMANTIC`, `WEIGHT_EXPERIENCE`, `WEIGHT_EDUCATION`, `WEIGHT_LOCATION`, and `WEIGHT_KEYWORDS`.

Required skills receive 70% of the skill signal and preferred skills receive 30%. Missing required skills are returned as high-severity gaps; preferred gaps are medium severity. Learning recommendations are generated only from those actual gaps.

## Match analysis API

`GET /api/recommendations/candidate/{candidateId}/job/{jobId}` returns the existing match fields plus `matchLevel`, `keywordScore`, `requiredSkillGaps`, `preferredSkillGaps`, `strengths`, `skillGaps`, `whyMatch`, `recommendation`, and `learningPlan`. Candidates can access their own analysis; administrators and recruiters retain privileged access.

The React job detail page renders the analysis with loading and fallback states, including score breakdown, matched skills, gaps, explanation, and a short learning plan.

## OpenAI integration

The backend supports an OpenAI-compatible provider for resume extraction, resume review, interview questions, and the candidate career assistant. The API key is read only by Spring Boot and is never sent to the frontend.

Set these environment variables before starting the backend:

```text
AI_PROVIDER=openai
AI_API_KEY=your-key
AI_MODEL=gpt-4o-mini
AI_BASE_URL=https://api.openai.com/v1
```

Docker Compose reads these values from the project `.env` file. When running Spring Boot directly from VS Code or Maven, configure the same variables in the process environment or launch configuration. Do not use a `VITE_` variable for the key.

OpenAI responses are requested as structured JSON and validated before they update a candidate profile. If the key is missing, the provider times out, or the response is invalid, `KeywordAiProvider` handles the same operation locally. The final match score is still calculated by the backend weighting engine; the model cannot assign or override it.

The current semantic score uses deterministic keyword overlap. Embedding-based semantic scoring can be added behind the existing `SemanticMatchingService` boundary without changing the API or frontend.

## Verification

Backend: `backend\\mvnw.cmd test`

Frontend: `cd frontend && npm run build`

For local login and registration, the backend must be running on port `8080` and connected to MySQL. Set `SPRING_DATASOURCE_USERNAME` and `SPRING_DATASOURCE_PASSWORD` in the backend environment; the repository default is `root`, but it must match the password configured in your local MySQL server. Docker Compose uses PostgreSQL instead and requires Docker Desktop to be running.
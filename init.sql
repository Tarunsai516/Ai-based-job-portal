-- TalentSync Database Initialization Script for PostgreSQL

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS candidates (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    name VARCHAR(255),
    title VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    avatar VARCHAR(500),
    experience VARCHAR(100),
    education VARCHAR(255),
    match_score INT DEFAULT 0,
    location VARCHAR(255),
    resume_url VARCHAR(500),
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
    id BIGSERIAL PRIMARY KEY,
    company_id VARCHAR(100),
    company_name VARCHAR(255) NOT NULL,
    company_logo VARCHAR(500),
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    salary VARCHAR(100),
    experience VARCHAR(100),
    type VARCHAR(50),
    description TEXT,
    recruiter_id VARCHAR(100),
    recruiter_name VARCHAR(255),
    recruiter_email VARCHAR(255),
    posted_time VARCHAR(100),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
    id BIGSERIAL PRIMARY KEY,
    job_id VARCHAR(100) NOT NULL,
    job_title VARCHAR(255),
    company_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'APPLIED',
    applied_date VARCHAR(100),
    match_score INT DEFAULT 0,
    candidate_id VARCHAR(100) NOT NULL,
    candidate_name VARCHAR(255),
    recruiter_id VARCHAR(100),
    recruiter_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT uk_candidate_job_application UNIQUE (candidate_id, job_id)
);

CREATE TABLE IF NOT EXISTS match_results (
    id BIGSERIAL PRIMARY KEY,
    candidate_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    overall_score DOUBLE PRECISION NOT NULL,
    semantic_score DOUBLE PRECISION NOT NULL,
    skill_score DOUBLE PRECISION NOT NULL,
    experience_score DOUBLE PRECISION NOT NULL,
    location_score DOUBLE PRECISION NOT NULL,
    education_score DOUBLE PRECISION NOT NULL,
    explanation TEXT,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_candidate_job_match UNIQUE (candidate_id, job_id)
);

CREATE TABLE IF NOT EXISTS interviews (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL,
    candidate_id BIGINT,
    recruiter_id BIGINT,
    job_id BIGINT,
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INT DEFAULT 60,
    type VARCHAR(50) DEFAULT 'TECHNICAL',
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    meeting_link VARCHAR(500),
    notes TEXT,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    role VARCHAR(50),
    title VARCHAR(255),
    message TEXT,
    time VARCHAR(100),
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial skills
INSERT INTO skills (name, normalized_name, category) VALUES
('Java', 'java', 'PROGRAMMING_LANGUAGE'),
('Spring Boot', 'spring boot', 'FRAMEWORK'),
('React', 'react', 'FRAMEWORK'),
('TypeScript', 'typescript', 'PROGRAMMING_LANGUAGE'),
('PostgreSQL', 'postgresql', 'DATABASE'),
('Docker', 'docker', 'DEVOPS'),
('Python', 'python', 'PROGRAMMING_LANGUAGE'),
('AWS', 'aws', 'DEVOPS')
ON CONFLICT (normalized_name) DO NOTHING;

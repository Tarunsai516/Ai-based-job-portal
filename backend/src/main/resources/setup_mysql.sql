-- ============================================================
-- AI-Based Job Portal (TalentSync) - MySQL Workbench Setup Script
-- Compatible with MySQL 8.0+ and MySQL Workbench
-- ============================================================

CREATE DATABASE IF NOT EXISTS `talentsync` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `talentsync`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL COMMENT 'seeker, recruiter, or admin'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Candidates Table
CREATE TABLE IF NOT EXISTS `candidates` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255),
  `title` VARCHAR(255),
  `email` VARCHAR(255),
  `phone` VARCHAR(100),
  `avatar` VARCHAR(255),
  `experience` VARCHAR(100),
  `education` VARCHAR(255),
  `match_score` INT DEFAULT 0,
  `location` VARCHAR(255),
  `resume_url` VARCHAR(500),
  `summary` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Candidate Skills Collection Tables
CREATE TABLE IF NOT EXISTS `candidate_skills` (
  `candidate_id` BIGINT NOT NULL,
  `skill` VARCHAR(255) NOT NULL,
  FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `candidate_missing_skills` (
  `candidate_id` BIGINT NOT NULL,
  `missing_skill` VARCHAR(255) NOT NULL,
  FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Companies Table
CREATE TABLE IF NOT EXISTS `companies` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `industry` VARCHAR(255),
  `location` VARCHAR(255),
  `employees` VARCHAR(100),
  `website` VARCHAR(255),
  `description` TEXT,
  `recruiter_id` BIGINT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Jobs Table
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `company_id` VARCHAR(100),
  `company_name` VARCHAR(255),
  `company_logo` VARCHAR(255),
  `title` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255),
  `salary` VARCHAR(100),
  `experience` VARCHAR(100),
  `type` VARCHAR(50) COMMENT 'Remote, Hybrid, Onsite',
  `description` TEXT,
  `recruiter_id` VARCHAR(100),
  `recruiter_name` VARCHAR(255),
  `recruiter_email` VARCHAR(255),
  `posted_time` VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Job Collections Tables
CREATE TABLE IF NOT EXISTS `job_skills` (
  `job_id` BIGINT NOT NULL,
  `skill` VARCHAR(255) NOT NULL,
  FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `job_responsibilities` (
  `job_id` BIGINT NOT NULL,
  `responsibility` TEXT,
  FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `job_qualifications` (
  `job_id` BIGINT NOT NULL,
  `qualification` TEXT,
  FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `job_benefits` (
  `job_id` BIGINT NOT NULL,
  `benefit` TEXT,
  FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Applications Table
CREATE TABLE IF NOT EXISTS `applications` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `job_id` VARCHAR(100),
  `job_title` VARCHAR(255),
  `company_name` VARCHAR(255),
  `status` VARCHAR(50) COMMENT 'Applied, Reviewing, Shortlisted, Interviewing, Rejected',
  `applied_date` VARCHAR(100),
  `match_score` INT DEFAULT 0,
  `candidate_id` VARCHAR(100),
  `candidate_name` VARCHAR(255),
  `recruiter_id` VARCHAR(100),
  `recruiter_email` VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `role` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT,
  `time` VARCHAR(100),
  `is_read` TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Seed Initial Data for Testing in MySQL Workbench
-- ============================================================

INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
(1, 'Alex Johnson', 'alex@example.com', '12345', 'seeker'),
(2, 'Jane Recruiter', 'jane@company.com', '12345', 'recruiter'),
(3, 'TalentSync Admin', 'admin@talentsync.com', 'admin', 'admin');

INSERT IGNORE INTO `candidates` (`id`, `name`, `title`, `email`, `phone`, `avatar`, `experience`, `education`, `match_score`, `location`, `resume_url`, `summary`) VALUES
(1, 'Alex Johnson', 'Senior Frontend Developer', 'alex@example.com', '+1 (555) 019-2834', '👨‍💻', '5 years', 'B.S. in Computer Science', 95, 'San Francisco, CA', 'Alex_Johnson_CV.pdf', 'Passionate frontend engineer with experience in React and modern UI systems.');

INSERT IGNORE INTO `candidate_skills` (`candidate_id`, `skill`) VALUES
(1, 'React'), (1, 'JavaScript'), (1, 'Tailwind CSS'), (1, 'TypeScript');

-- Verify Setup
SELECT 'MySQL Database talentsync configured successfully!' AS `Status`;

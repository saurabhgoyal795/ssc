-- SSC Exam Platform Database Schema
-- Version: 1.0
-- Description: Initial schema with all core tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE USER & AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_role CHECK (role IN ('STUDENT', 'ADMIN', 'CONTENT_CREATOR'))
);

CREATE TABLE user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_exam VARCHAR(100),
    preferred_language VARCHAR(10) DEFAULT 'en',
    daily_study_goal_minutes INT DEFAULT 120,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- SUBSCRIPTION & PAYMENTS
-- ============================================================================

CREATE TABLE subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INT NOT NULL,
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id BIGINT NOT NULL REFERENCES subscription_plans(id),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    subscription_id BIGINT REFERENCES user_subscriptions(id),
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(500),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_payment_status CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'))
);

-- ============================================================================
-- CONTENT TAXONOMY
-- ============================================================================

CREATE TABLE subjects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE topics (
    id BIGSERIAL PRIMARY KEY,
    subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    parent_topic_id BIGINT REFERENCES topics(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(subject_id, slug)
);

-- ============================================================================
-- QUESTION BANK
-- ============================================================================

CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    subject_id BIGINT NOT NULL REFERENCES subjects(id),
    topic_id BIGINT REFERENCES topics(id),
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL DEFAULT 'SINGLE_CHOICE',
    difficulty_level VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    marks DECIMAL(5, 2) DEFAULT 1.0,
    negative_marks DECIMAL(5, 2) DEFAULT 0.25,
    solution_text TEXT,
    solution_video_url VARCHAR(500),
    explanation TEXT,
    created_by BIGINT REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_question_type CHECK (question_type IN ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'NUMERICAL')),
    CONSTRAINT chk_difficulty CHECK (difficulty_level IN ('EASY', 'MEDIUM', 'HARD'))
);

CREATE TABLE question_options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    option_order INT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE question_tags (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(question_id, tag)
);

-- ============================================================================
-- TESTS & ASSESSMENTS
-- ============================================================================

CREATE TABLE tests (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    test_type VARCHAR(50) NOT NULL,
    difficulty_level VARCHAR(50) DEFAULT 'MEDIUM',
    duration_minutes INT NOT NULL,
    total_marks DECIMAL(10, 2) NOT NULL,
    passing_marks DECIMAL(10, 2),
    instructions TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_test_type CHECK (test_type IN ('MOCK_TEST', 'SECTION_TEST', 'TOPIC_TEST', 'PREVIOUS_YEAR', 'PRACTICE'))
);

CREATE TABLE test_sections (
    id BIGSERIAL PRIMARY KEY,
    test_id BIGINT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    subject_id BIGINT NOT NULL REFERENCES subjects(id),
    section_name VARCHAR(255) NOT NULL,
    section_order INT NOT NULL,
    duration_minutes INT,
    total_marks DECIMAL(10, 2) NOT NULL,
    instructions TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE test_questions (
    id BIGSERIAL PRIMARY KEY,
    test_id BIGINT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    section_id BIGINT REFERENCES test_sections(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES questions(id),
    question_order INT NOT NULL,
    marks DECIMAL(5, 2) NOT NULL,
    negative_marks DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(test_id, question_id)
);

CREATE TABLE user_test_attempts (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    test_id BIGINT NOT NULL REFERENCES tests(id),
    attempt_number INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    time_taken_seconds INT,
    total_score DECIMAL(10, 2),
    correct_answers INT DEFAULT 0,
    incorrect_answers INT DEFAULT 0,
    unanswered INT DEFAULT 0,
    accuracy_percentage DECIMAL(5, 2),
    percentile DECIMAL(5, 2),
    rank INT,
    session_data JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_attempt_status CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'EXPIRED', 'ABANDONED')),
    UNIQUE(user_id, test_id, attempt_number)
);

CREATE TABLE user_test_responses (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT NOT NULL REFERENCES user_test_attempts(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES questions(id),
    selected_option_ids BIGINT[],
    numerical_answer DECIMAL(10, 4),
    is_correct BOOLEAN,
    marks_obtained DECIMAL(5, 2),
    time_taken_seconds INT,
    is_bookmarked BOOLEAN DEFAULT FALSE,
    is_marked_for_review BOOLEAN DEFAULT FALSE,
    answered_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(attempt_id, question_id)
);

-- ============================================================================
-- STUDY MATERIALS
-- ============================================================================

CREATE TABLE study_materials (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    subject_id BIGINT REFERENCES subjects(id),
    topic_id BIGINT REFERENCES topics(id),
    material_type VARCHAR(50) NOT NULL,
    file_url VARCHAR(500),
    s3_key VARCHAR(500),
    file_size_bytes BIGINT,
    thumbnail_url VARCHAR(500),
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    download_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_material_type CHECK (material_type IN ('PDF', 'ARTICLE', 'NOTES', 'CHEAT_SHEET'))
);

-- ============================================================================
-- VIDEO LEARNING
-- ============================================================================

CREATE TABLE video_courses (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    subject_id BIGINT REFERENCES subjects(id),
    thumbnail_url VARCHAR(500),
    instructor_name VARCHAR(255),
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    total_duration_seconds INT DEFAULT 0,
    video_count INT DEFAULT 0,
    enrollment_count INT DEFAULT 0,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE videos (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    course_id BIGINT NOT NULL REFERENCES video_courses(id) ON DELETE CASCADE,
    topic_id BIGINT REFERENCES topics(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    video_order INT NOT NULL,
    duration_seconds INT NOT NULL,
    video_provider VARCHAR(50) NOT NULL DEFAULT 'YOUTUBE',
    video_id VARCHAR(255) NOT NULL,
    video_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    is_free BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_video_provider CHECK (video_provider IN ('YOUTUBE', 'VIMEO', 'S3')),
    UNIQUE(course_id, slug)
);

CREATE TABLE video_watch_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id BIGINT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    last_watched_position_seconds INT DEFAULT 0,
    watch_percentage DECIMAL(5, 2) DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, video_id)
);

-- ============================================================================
-- ANALYTICS & PERFORMANCE TRACKING
-- ============================================================================

CREATE TABLE user_subject_analytics (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    total_questions_attempted INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    incorrect_answers INT DEFAULT 0,
    accuracy_percentage DECIMAL(5, 2) DEFAULT 0,
    average_time_per_question_seconds INT DEFAULT 0,
    strength_score DECIMAL(5, 2) DEFAULT 0,
    last_attempted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, subject_id)
);

CREATE TABLE user_topic_analytics (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id BIGINT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    total_questions_attempted INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    incorrect_answers INT DEFAULT 0,
    accuracy_percentage DECIMAL(5, 2) DEFAULT 0,
    strength_score DECIMAL(5, 2) DEFAULT 0,
    last_attempted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, topic_id)
);

CREATE TABLE daily_activity_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    study_time_minutes INT DEFAULT 0,
    questions_attempted INT DEFAULT 0,
    tests_taken INT DEFAULT 0,
    videos_watched INT DEFAULT 0,
    materials_read INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, activity_date)
);

CREATE TABLE leaderboard_cache (
    id BIGSERIAL PRIMARY KEY,
    test_id BIGINT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rank INT NOT NULL,
    score DECIMAL(10, 2) NOT NULL,
    percentile DECIMAL(5, 2),
    cached_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(test_id, user_id)
);

-- ============================================================================
-- BOOKMARKS & USER INTERACTIONS
-- ============================================================================

CREATE TABLE bookmarks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_entity_type CHECK (entity_type IN ('QUESTION', 'MATERIAL', 'VIDEO')),
    UNIQUE(user_id, entity_type, entity_id)
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_notification_type CHECK (notification_type IN ('TEST_RESULT', 'COURSE_UPDATE', 'SUBSCRIPTION', 'ANNOUNCEMENT', 'REMINDER'))
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Question indexes
CREATE INDEX idx_questions_composite ON questions(subject_id, topic_id, difficulty_level, is_active);
CREATE INDEX idx_questions_subject ON questions(subject_id) WHERE is_active = TRUE;
CREATE INDEX idx_questions_topic ON questions(topic_id) WHERE is_active = TRUE;

-- Test indexes
CREATE INDEX idx_tests_published ON tests(is_published, is_active);
CREATE INDEX idx_tests_type ON tests(test_type, is_active);
CREATE INDEX idx_tests_slug ON tests(slug);

-- Test attempt indexes
CREATE INDEX idx_attempts_user ON user_test_attempts(user_id, submitted_at DESC);
CREATE INDEX idx_attempts_test ON user_test_attempts(test_id, status);
CREATE INDEX idx_attempts_score ON user_test_attempts(test_id, total_score DESC) WHERE status = 'SUBMITTED';
CREATE INDEX idx_attempts_status ON user_test_attempts(status, started_at);

-- Analytics indexes
CREATE INDEX idx_subject_analytics ON user_subject_analytics(user_id, subject_id);
CREATE INDEX idx_topic_analytics ON user_topic_analytics(user_id, topic_id);
CREATE INDEX idx_daily_activity ON daily_activity_log(user_id, activity_date DESC);

-- Notification indexes
CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at DESC) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);

-- Leaderboard indexes
CREATE INDEX idx_leaderboard_test_rank ON leaderboard_cache(test_id, rank);
CREATE INDEX idx_leaderboard_user ON leaderboard_cache(user_id);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default subjects
INSERT INTO subjects (name, slug, description, icon, display_order) VALUES
('General Intelligence & Reasoning', 'reasoning', 'Logical and analytical reasoning', '🧠', 1),
('General Awareness', 'general-awareness', 'Current affairs and general knowledge', '📰', 2),
('Quantitative Aptitude', 'quantitative-aptitude', 'Mathematics and numerical ability', '🔢', 3),
('English Language', 'english', 'Grammar, vocabulary, and comprehension', '📚', 4);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, slug, description, price, duration_days, features) VALUES
('Free Plan', 'free', 'Basic access to platform features', 0, 365,
 '{"tests_per_month": 5, "study_materials": false, "videos": false, "analytics": "basic"}'::jsonb),
('Monthly Pro', 'monthly-pro', 'Full access to all features for 1 month', 299, 30,
 '{"tests_per_month": "unlimited", "study_materials": true, "videos": true, "analytics": "advanced"}'::jsonb),
('Quarterly Pro', 'quarterly-pro', 'Full access to all features for 3 months', 799, 90,
 '{"tests_per_month": "unlimited", "study_materials": true, "videos": true, "analytics": "advanced"}'::jsonb),
('Yearly Pro', 'yearly-pro', 'Full access to all features for 1 year', 2499, 365,
 '{"tests_per_month": "unlimited", "study_materials": true, "videos": true, "analytics": "advanced"}'::jsonb);

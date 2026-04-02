-- DROP ALL TABLES (use carefully!)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS users, categories, tags, contacts, invitation_types, events, gifts, event_contacts, responsibles, personal_access_tokens, cache, jobs;
SET FOREIGN_KEY_CHECKS = 1;

-- Recreate tables
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    role ENUM('admin', 'editor', 'viewer') NOT NULL DEFAULT 'viewer'
);

CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

CREATE TABLE tags (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

CREATE TABLE invitation_types (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

CREATE TABLE responsibles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NULL,
    email VARCHAR(255) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

CREATE TABLE contacts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    is_priest TINYINT(1) DEFAULT 0,
    father_name VARCHAR(255) NULL,
    priority_contact ENUM('call', 'sms', 'messenger', 'email') NULL,
    phone VARCHAR(50) NULL,
    email VARCHAR(255) NULL,
    social VARCHAR(255) NULL,
    birthday DATE NULL,
    responsible_id BIGINT UNSIGNED NULL,
    category_id BIGINT UNSIGNED NULL,
    invitation_types TEXT NULL,
    required_invitations TEXT NULL,
    postal_address TEXT NULL,
    region VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (responsible_id) REFERENCES responsibles(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE contact_tags (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    contact_id BIGINT UNSIGNED NOT NULL,
    tag_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    event_date DATETIME NOT NULL,
    invitation_type_id BIGINT UNSIGNED NULL,
    is_regular TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (invitation_type_id) REFERENCES invitation_types(id) ON DELETE SET NULL
);

CREATE TABLE gifts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    given_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

CREATE TABLE event_contacts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT UNSIGNED NOT NULL,
    contact_id BIGINT UNSIGNED NOT NULL,
    gift_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    FOREIGN KEY (gift_id) REFERENCES gifts(id) ON DELETE SET NULL
);

-- INSERT DATA

-- Users
INSERT INTO users (id, name, email, password, role, created_at, updated_at) VALUES 
(1, 'Admin', 'admin@handysearch.local', '$2y$12$4BPHluNLjUenDHBJvDRKzu78RXnGDNCzIimwKfRRr1vYw5kn/kSYm', 'admin', NOW(), NOW()),
(2, 'Editor', 'editor@handysearch.local', '$2y$12$tl0Ejo1LJNhAex1pcBbXeu.7DHKJmKu0.e3.54C/rX1KvCK9i31Ca', 'editor', NOW(), NOW()),
(3, 'Viewer', 'viewer@handysearch.local', '$2y$12$Nqm/0fZ7YqRoWYoaMO5cSeaDCt7lzasyKobOz979fB9i8KvYbGpBi', 'viewer', NOW(), NOW());

-- Categories
INSERT INTO categories (name, color, created_at, updated_at) VALUES 
('Культура', '#ec4899', NOW(), NOW()),
('История', '#8b5cf6', NOW(), NOW()),
('Русский университет', '#3b82f6', NOW(), NOW()),
('Священнослужители', '#f59e0b', NOW(), NOW()),
('Спонсоры', '#10b981', NOW(), NOW()),
('Образование', '#06b6d4', NOW(), NOW()),
('Наука', '#ef4444', NOW(), NOW());

-- Tags
INSERT INTO tags (name, color, created_at, updated_at) VALUES 
('Друг', '#3b82f6', NOW(), NOW()),
('Эксперт', '#8b5cf6', NOW(), NOW()),
('Партнёр', '#10b981', NOW(), NOW()),
('Благотворитель', '#f59e0b', NOW(), NOW());

-- Invitation Types
INSERT INTO invitation_types (name, color, created_at, updated_at) VALUES 
('Конференция', '#3b82f6', NOW(), NOW()),
('Ужин', '#10b981', NOW(), NOW()),
('Встреча', '#8b5cf6', NOW(), NOW()),
('Презентация', '#f59e0b', NOW(), NOW()),
('Юбилей', '#ec4899', NOW(), NOW());

-- Responsibles
INSERT INTO responsibles (name, phone, email, notes, created_at, updated_at) VALUES 
('Основной ответственный', '+79001234567', 'responsible@handysearch.local', '', NOW(), NOW());

SELECT 'Done! Tables and data created.' AS result;

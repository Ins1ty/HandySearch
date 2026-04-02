

-- Table: users
INSERT INTO users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role) VALUES (1, 'Admin', 'admin@handysearch.local', NULL, '$2y$12$4BPHluNLjUenDHBJvDRKzu78RXnGDNCzIimwKfRRr1vYw5kn/kSYm', NULL, '2026-04-02 09:24:16', '2026-04-02 09:24:16', 'admin');
INSERT INTO users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role) VALUES (2, 'Editor', 'editor@handysearch.local', NULL, '$2y$12$tl0Ejo1LJNhAex1pcBbXeu.7DHKJmKu0.e3.54C/rX1KvCK9i31Ca', NULL, '2026-04-02 09:24:16', '2026-04-02 09:24:16', 'editor');
INSERT INTO users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role) VALUES (3, 'Viewer', 'viewer@handysearch.local', NULL, '$2y$12$Nqm/0fZ7YqRoWYoaMO5cSeaDCt7lzasyKobOz979fB9i8KvYbGpBi', NULL, '2026-04-02 09:24:17', '2026-04-02 09:24:17', 'viewer');


-- Table: categories
INSERT INTO categories (id, name, color, created_at, updated_at) VALUES (1, 'Культура', '#ec4899', '2026-04-02 09:24:17', '2026-04-02 09:24:17');
INSERT INTO categories (id, name, color, created_at, updated_at) VALUES (2, 'История', '#8b5cf6', '2026-04-02 09:24:17', '2026-04-02 09:24:17');
INSERT INTO categories (id, name, color, created_at, updated_at) VALUES (3, 'Русский университет', '#3b82f6', '2026-04-02 09:24:17', '2026-04-02 09:24:17');
INSERT INTO categories (id, name, color, created_at, updated_at) VALUES (4, 'Священнослужители', '#f59e0b', '2026-04-02 09:24:17', '2026-04-02 09:24:17');
INSERT INTO categories (id, name, color, created_at, updated_at) VALUES (5, 'Спонсоры', '#10b981', '2026-04-02 09:24:17', '2026-04-02 09:24:17');
INSERT INTO categories (id, name, color, created_at, updated_at) VALUES (6, 'Образование', '#06b6d4', '2026-04-02 09:24:17', '2026-04-02 09:24:17');
INSERT INTO categories (id, name, color, created_at, updated_at) VALUES (7, 'Наука', '#ef4444', '2026-04-02 09:24:17', '2026-04-02 09:24:17');


-- Table: tags
INSERT INTO tags (id, name, color, created_at, updated_at) VALUES (1, 'Друг', '#3b82f6', '2026-04-02 09:24:17', '2026-04-02 09:24:17');
INSERT INTO tags (id, name, color, created_at, updated_at) VALUES (2, 'Эксперт', '#8b5cf6', '2026-04-02 09:24:17', '2026-04-02 09:24:17');
INSERT INTO tags (id, name, color, created_at, updated_at) VALUES (3, 'Партнёр', '#10b981', '2026-04-02 09:24:17', '2026-04-02 09:24:17');
INSERT INTO tags (id, name, color, created_at, updated_at) VALUES (4, 'Благотворитель', '#f59e0b', '2026-04-02 09:24:17', '2026-04-02 09:24:17');


-- Table: invitation_types
INSERT INTO invitation_types (id, name, color, created_at, updated_at) VALUES (1, 'Конференция', '#3b82f6', '2026-04-02 09:24:17', '2026-04-02 09:24:17');
INSERT INTO invitation_types (id, name, color, created_at, updated_at) VALUES (2, 'Ужин', '#10b981', '2026-04-02 09:24:17', '2026-04-02 09:24:17');
INSERT INTO invitation_types (id, name, color, created_at, updated_at) VALUES (3, 'Встреча', '#8b5cf6', '2026-04-02 09:24:17', '2026-04-02 09:24:17');
INSERT INTO invitation_types (id, name, color, created_at, updated_at) VALUES (4, 'Презентация', '#f59e0b', '2026-04-02 09:24:17', '2026-04-02 09:24:17');
INSERT INTO invitation_types (id, name, color, created_at, updated_at) VALUES (5, 'Юбилей', '#ec4899', '2026-04-02 09:24:17', '2026-04-02 09:24:17');


-- Table: responsibles
INSERT INTO responsibles (id, name, phone, email, notes, created_at, updated_at) VALUES (1, 'Основной ответственный', +79001234567, 'responsible@handysearch.local', NULL, '2026-04-02 09:24:17', '2026-04-02 09:24:17');


-- Table: invitation_types
INSERT INTO invitation_types (id, name, color, created_at, updated_at) VALUES (1, 'Конференция', '#3b82f6', '2026-04-02 09:24:17', '2026-04-02 09:24:17');
INSERT INTO invitation_types (id, name, color, created_at, updated_at) VALUES (2, 'Ужин', '#10b981', '2026-04-02 09:24:17', '2026-04-02 09:24:17');
INSERT INTO invitation_types (id, name, color, created_at, updated_at) VALUES (3, 'Встреча', '#8b5cf6', '2026-04-02 09:24:17', '2026-04-02 09:24:17');
INSERT INTO invitation_types (id, name, color, created_at, updated_at) VALUES (4, 'Презентация', '#f59e0b', '2026-04-02 09:24:17', '2026-04-02 09:24:17');
INSERT INTO invitation_types (id, name, color, created_at, updated_at) VALUES (5, 'Юбилей', '#ec4899', '2026-04-02 09:24:17', '2026-04-02 09:24:17');

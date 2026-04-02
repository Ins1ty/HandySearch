<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportMySQL extends Command
{
    protected $signature = 'import:mysql {--force : Force import even if data exists}';
    protected $description = 'Import data from local SQLite to MySQL';

    public function handle()
    {
        $this->info('Starting MySQL import...');
        
        // Check if tables exist
        try {
            DB::connection('mysql')->table('users')->count();
        } catch (\Exception $e) {
            $this->error('MySQL not connected or tables do not exist. Run migrations first.');
            return 1;
        }

        // Users
        if ($this->option('force') || DB::connection('mysql')->table('users')->count() == 0) {
            $this->info('Importing users...');
            DB::connection('mysql')->statement("
                INSERT INTO users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role) VALUES 
                (1, 'Admin', 'admin@handysearch.local', NULL, '\$2y\$12\$4BPHluNLjUenDHBJvDRKzu78RXnGDNCzIimwKfRRr1vYw5kn/kSYm', NULL, '2026-04-02 09:24:16', '2026-04-02 09:24:16', 'admin'),
                (2, 'Editor', 'editor@handysearch.local', NULL, '\$2y\$12\$tl0Ejo1LJNhAex1pcBbXeu.7DHKJmKu0.e3.54C/rX1KvCK9i31Ca', NULL, '2026-04-02 09:24:16', '2026-04-02 09:24:16', 'editor'),
                (3, 'Viewer', 'viewer@handysearch.local', NULL, '\$2y\$12\$Nqm/0fZ7YqRoWYoaMO5cSeaDCt7lzasyKobOz979fB9i8KvYbGpBi', NULL, '2026-04-02 09:24:17', '2026-04-02 09:24:17', 'viewer')
            ");
            $this->info('Users imported!');
        } else {
            $this->info('Users already exist, skipping...');
        }

        // Categories
        if ($this->option('force') || DB::connection('mysql')->table('categories')->count() == 0) {
            $this->info('Importing categories...');
            DB::connection('mysql')->statement("
                INSERT INTO categories (name, color, created_at, updated_at) VALUES 
                ('Культура', '#ec4899', NOW(), NOW()),
                ('История', '#8b5cf6', NOW(), NOW()),
                ('Русский университет', '#3b82f6', NOW(), NOW()),
                ('Священнослужители', '#f59e0b', NOW(), NOW()),
                ('Спонсоры', '#10b981', NOW(), NOW()),
                ('Образование', '#06b6d4', NOW(), NOW()),
                ('Наука', '#ef4444', NOW(), NOW())
            ");
            $this->info('Categories imported!');
        }

        // Tags
        if ($this->option('force') || DB::connection('mysql')->table('tags')->count() == 0) {
            $this->info('Importing tags...');
            DB::connection('mysql')->statement("
                INSERT INTO tags (name, color, created_at, updated_at) VALUES 
                ('Друг', '#3b82f6', NOW(), NOW()),
                ('Эксперт', '#8b5cf6', NOW(), NOW()),
                ('Партнёр', '#10b981', NOW(), NOW()),
                ('Благотворитель', '#f59e0b', NOW(), NOW())
            ");
            $this->info('Tags imported!');
        }

        // Invitation Types
        if ($this->option('force') || DB::connection('mysql')->table('invitation_types')->count() == 0) {
            $this->info('Importing invitation_types...');
            DB::connection('mysql')->statement("
                INSERT INTO invitation_types (name, color, created_at, updated_at) VALUES 
                ('Конференция', '#3b82f6', NOW(), NOW()),
                ('Ужин', '#10b981', NOW(), NOW()),
                ('Встреча', '#8b5cf6', NOW(), NOW()),
                ('Презентация', '#f59e0b', NOW(), NOW()),
                ('Юбилей', '#ec4899', NOW(), NOW())
            ");
            $this->info('Invitation types imported!');
        }

        // Responsibles
        if ($this->option('force') || DB::connection('mysql')->table('responsibles')->count() == 0) {
            $this->info('Importing responsibles...');
            DB::connection('mysql')->statement("
                INSERT INTO responsibles (name, phone, email, notes, created_at, updated_at) VALUES 
                ('Основной ответственный', '+79001234567', 'responsible@handysearch.local', '', NOW(), NOW())
            ");
            $this->info('Responsibles imported!');
        }

        $this->info('Import completed successfully!');
        return 0;
    }
}

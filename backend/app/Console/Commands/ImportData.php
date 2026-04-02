<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportData extends Command
{
    protected $signature = 'import:data';
    protected $description = 'Import data to MySQL';

    public function handle()
    {
        $this->info('Inserting users...');
        
        DB::statement("INSERT INTO users (id, name, email, email_verified_at, password, remember_token, role, created_at, updated_at) VALUES 
            (1, 'Admin', 'admin@handysearch.local', NULL, '\$2y\$12\$4BPHluNLjUenDHBJvDRKzu78RXnGDNCzIimwKfRRr1vYw5kn/kSYm', NULL, 'admin', '2026-04-02 09:24:16', '2026-04-02 09:24:16')");
            
        DB::statement("INSERT INTO users (id, name, email, email_verified_at, password, remember_token, role, created_at, updated_at) VALUES 
            (2, 'Editor', 'editor@handysearch.local', NULL, '\$2y\$12\$tl0Ejo1LJNhAex1pcBbXeu.7DHKJmKu0.e3.54C/rX1KvCK9i31Ca', NULL, 'editor', '2026-04-02 09:24:16', '2026-04-02 09:24:16')");
            
        DB::statement("INSERT INTO users (id, name, email, email_verified_at, password, remember_token, role, created_at, updated_at) VALUES 
            (3, 'Viewer', 'viewer@handysearch.local', NULL, '\$2y\$12\$Nqm/0fZ7YqRoWYoaMO5cSeaDCt7lzasyKobOz979fB9i8KvYbGpBi', NULL, 'viewer', '2026-04-02 09:24:17', '2026-04-02 09:24:17')");

        $this->info('Inserting categories...');
        
        $categories = [
            [1, 'Культура', '#ec4899'],
            [2, 'История', '#8b5cf6'],
            [3, 'Русский университет', '#3b82f6'],
            [4, 'Священнослужители', '#f59e0b'],
            [5, 'Спонсоры', '#10b981'],
            [6, 'Образование', '#06b6d4'],
            [7, 'Наука', '#ef4444'],
        ];
        
        foreach ($categories as $cat) {
            DB::statement("INSERT INTO categories (id, name, color, created_at, updated_at) VALUES ($cat[0], '$cat[1]', '$cat[2]', '2026-04-02 09:24:17', '2026-04-02 09:24:17')");
        }

        $this->info('Inserting tags...');
        
        $tags = [
            [1, 'Друг', '#3b82f6'],
            [2, 'Эксперт', '#8b5cf6'],
            [3, 'Партнёр', '#10b981'],
            [4, 'Благотворитель', '#f59e0b'],
        ];
        
        foreach ($tags as $tag) {
            DB::statement("INSERT INTO tags (id, name, color, created_at, updated_at) VALUES ($tag[0], '$tag[1]', '$tag[2]', '2026-04-02 09:24:17', '2026-04-02 09:24:17')");
        }

        $this->info('Inserting invitation_types...');
        
        $types = [
            [1, 'Конференция', '#3b82f6'],
            [2, 'Ужин', '#10b981'],
            [3, 'Встреча', '#8b5cf6'],
            [4, 'Презентация', '#f59e0b'],
            [5, 'Юбилей', '#ec4899'],
        ];
        
        foreach ($types as $type) {
            DB::statement("INSERT INTO invitation_types (id, name, color, created_at, updated_at) VALUES ($type[0], '$type[1]', '$type[2]', '2026-04-02 09:24:17', '2026-04-02 09:24:17')");
        }

        $this->info('Inserting responsibles...');
        
        DB::statement("INSERT INTO responsibles (id, name, phone, email, notes, created_at, updated_at) VALUES (1, 'Основной ответственный', '+79001234567', 'responsible@handysearch.local', '', '2026-04-02 09:24:17', '2026-04-02 09:24:17')");

        $this->info('Data imported successfully!');
        
        return 0;
    }
}

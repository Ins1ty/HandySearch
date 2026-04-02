<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\InvitationType;
use App\Models\Responsible;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@handysearch.local'],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        User::firstOrCreate(
            ['email' => 'editor@handysearch.local'],
            [
                'name' => 'Editor',
                'password' => Hash::make('editor123'),
                'role' => 'editor',
            ]
        );

        User::firstOrCreate(
            ['email' => 'viewer@handysearch.local'],
            [
                'name' => 'Viewer',
                'password' => Hash::make('viewer123'),
                'role' => 'viewer',
            ]
        );

        $categories = [
            ['name' => 'Культура', 'color' => '#ec4899'],
            ['name' => 'История', 'color' => '#8b5cf6'],
            ['name' => 'Русский университет', 'color' => '#3b82f6'],
            ['name' => 'Священнослужители', 'color' => '#f59e0b'],
            ['name' => 'Спонсоры', 'color' => '#10b981'],
            ['name' => 'Образование', 'color' => '#06b6d4'],
            ['name' => 'Наука', 'color' => '#ef4444'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }

        $tags = [
            ['name' => 'Друг', 'color' => '#3b82f6'],
            ['name' => 'Эксперт', 'color' => '#8b5cf6'],
            ['name' => 'Партнёр', 'color' => '#10b981'],
            ['name' => 'Благотворитель', 'color' => '#f59e0b'],
            ['name' => 'Священник', 'color' => '#7c3aed'],
        ];

        foreach ($tags as $tag) {
            \App\Models\Tag::create($tag);
        }

        $invitationTypes = [
            ['name' => 'Конференция', 'color' => '#3b82f6'],
            ['name' => 'Ужин', 'color' => '#10b981'],
            ['name' => 'Встреча', 'color' => '#8b5cf6'],
            ['name' => 'Презентация', 'color' => '#f59e0b'],
            ['name' => 'Юбилей', 'color' => '#ec4899'],
        ];

        foreach ($invitationTypes as $type) {
            InvitationType::create($type);
        }

        $responsibles = [
            ['name' => 'Основной ответственный', 'phone' => '+79001234567', 'email' => 'responsible@handysearch.local'],
        ];

        foreach ($responsibles as $resp) {
            Responsible::firstOrCreate(['name' => $resp['name']], $resp);
        }
    }
}

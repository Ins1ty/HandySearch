<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contacts', function ($table) {
            $table->dropForeign(['responsible_id']);
        });
        
        Schema::table('contacts', function ($table) {
            $table->foreignId('responsible_id')->constrained('responsibles')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('contacts', function ($table) {
            $table->dropForeign(['responsible_id']);
        });
        
        Schema::table('contacts', function ($table) {
            $table->foreignId('responsible_id')->constrained('users')->nullOnDelete();
        });
    }
};

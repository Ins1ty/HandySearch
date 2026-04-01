<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE contacts MODIFY COLUMN responsible_id BIGINT UNSIGNED NULL");
        
        Schema::table('contacts', function (Blueprint $table) {
            $table->foreign('responsible_id')
                ->references('id')
                ->on('responsibles')
                ->nullOnDelete()
                ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropForeign(['responsible_id']);
        });
        
        DB::statement("ALTER TABLE contacts MODIFY COLUMN responsible_id BIGINT UNSIGNED NULL");
        $table->foreign('responsible_id')
            ->references('id')
            ->on('users')
            ->nullOnDelete()
            ->onUpdate('cascade');
    }
};
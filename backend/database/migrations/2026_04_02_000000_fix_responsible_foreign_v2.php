<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropForeign(['responsible_id']);
            $table->unsignedBigInteger('responsible_id')->nullable()->change();
            $table->foreign('responsible_id')->references('id')->on('responsibles')->nullOnDelete();
        });
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropForeign(['responsible_id']);
            $table->foreignId('responsible_id')->nullable()->constrained('users')->nullOnDelete();
        });
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
};
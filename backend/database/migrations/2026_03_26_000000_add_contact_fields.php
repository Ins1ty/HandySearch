<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->boolean('is_priest')->default(false)->after('description');
            $table->string('father_name')->nullable()->after('is_priest');
            $table->enum('priority_contact', ['call', 'sms', 'messenger', 'email'])->nullable()->after('father_name');
            $table->text('postal_address')->nullable()->after('priority_contact');
            $table->string('region')->nullable()->after('postal_address');
        });
    }

    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropColumn(['is_priest', 'father_name', 'priority_contact', 'postal_address', 'region']);
        });
    }
};

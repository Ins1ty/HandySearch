<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->boolean('visible_only_to_admin')->default(false)->after('required_invitations');
            $table->boolean('visible_only_to_editor')->default(false)->after('visible_only_to_admin');
            $table->string('region')->nullable()->after('postal_address');
        });
    }

    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropColumn(['visible_only_to_admin', 'visible_only_to_editor', 'region']);
        });
    }
};
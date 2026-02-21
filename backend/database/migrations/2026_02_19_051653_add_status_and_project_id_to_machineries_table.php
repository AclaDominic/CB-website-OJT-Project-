<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('machineries', function (Blueprint $table) {
            $table->string('status')->default('Stand By')->after('type'); // Stand By, Maintenance, Decommissioned, Lease, Active
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('machineries', function (Blueprint $table) {
            $table->boolean('is_decommissioned')->default(false);
            $table->dropForeign(['project_id']);
            $table->dropColumn(['status', 'project_id']);
        });
    }
};

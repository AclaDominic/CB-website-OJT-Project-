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

        // Migrate existing 'is_decommissioned' data
        \DB::table('machineries')->where('is_decommissioned', true)->update(['status' => 'Decommissioned']);

        // Use raw SQL or separate command to Drop is_decommissioned if desired, but keeping for safety for now or just ignoring it.
        // Let's drop it to be clean, but after data migration.
        Schema::table('machineries', function (Blueprint $table) {
            $table->dropColumn('is_decommissioned');
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

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('procurement_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Requester
            $table->string('status')->default('draft');
            $table->text('remarks')->nullable(); // Requester remarks
            $table->text('supplier_notes')->nullable(); // Staff notes
            $table->date('expected_arrival_date')->nullable();
            $table->timestamps();
        });

        Schema::create('procurement_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('procurement_request_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->decimal('quantity', 10, 2);
            $table->string('unit'); // kg, pcs, bags, etc.
            $table->string('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('procurement_items');
        Schema::dropIfExists('procurement_requests');
    }
};

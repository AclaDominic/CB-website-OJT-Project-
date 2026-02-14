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
        Schema::create('inventory_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('inventory_categories')->onDelete('cascade');
            $table->string('name');
            $table->string('sku')->nullable()->unique();
            $table->text('description')->nullable();
            $table->integer('quantity')->default(0);
            $table->integer('threshold')->default(0);
            $table->string('unit')->nullable(); // e.g., 'pcs', 'box', 'kg'
            $table->timestamps();
        });

        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->onDelete('cascade');
            $table->unsignedBigInteger('user_id')->nullable(); // Nullable if system auto-update, or if user deleted
            $table->string('type'); // 'in', 'out', 'adjustment'
            $table->integer('quantity'); // Positive for in, negative for out? Or always positive and type determines sign? Let's use signed logic in code but store absolute here + type? Or just store change amount.
            // Let's store signed amount or just quantity and type. 
            // Better: 'quantity' is the amount changed. Type clarifies intent.
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
        Schema::dropIfExists('inventory_items');
        Schema::dropIfExists('inventory_categories');
    }
};

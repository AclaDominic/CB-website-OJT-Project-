<?php

namespace Tests\Feature;

use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InventoryTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);
        $this->user = User::factory()->create();
        $this->user->assignRole('Admin');
    }

    public function test_can_create_inventory_category()
    {
        $this->withoutExceptionHandling();
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->postJson('/api/inventory-categories', [
            'name' => 'Office Supplies',
            'description' => 'Pens, paper, etc.'
        ]);

        $response->assertStatus(201)
            ->assertJson(['name' => 'Office Supplies']);

        $this->assertDatabaseHas('inventory_categories', ['name' => 'Office Supplies']);
    }

    public function test_can_create_inventory_item()
    {
        $this->withoutExceptionHandling();
        $category = InventoryCategory::create(['name' => 'Electronics']);
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->postJson('/api/inventory-items', [
            'category_id' => $category->id,
            'name' => 'Laptop',
            'threshold' => 5,
            'initial_stock' => 10
        ]);

        $response->assertStatus(201)
            ->assertJson(['name' => 'Laptop', 'quantity' => 10]);

        $this->assertDatabaseHas('inventory_items', ['name' => 'Laptop', 'quantity' => 10]);
        $this->assertDatabaseHas('inventory_transactions', ['quantity' => 10, 'type' => 'initial']);
    }

    public function test_can_add_stock()
    {
        $this->withoutExceptionHandling();
        $category = InventoryCategory::create(['name' => 'Hardware']);
        $item = InventoryItem::create([
            'category_id' => $category->id,
            'name' => 'Screw',
            'quantity' => 100
        ]);

        Sanctum::actingAs($this->user, ['*']);

        $response = $this->postJson("/api/inventory-items/{$item->id}/add-stock", [
            'quantity' => 50,
            'remarks' => 'Restock'
        ]);

        $response->assertStatus(200)
            ->assertJson(['quantity' => 150]);

        $this->assertDatabaseHas('inventory_items', ['id' => $item->id, 'quantity' => 150]);
        $this->assertDatabaseHas('inventory_transactions', ['inventory_item_id' => $item->id, 'type' => 'in', 'quantity' => 50]);
    }

    public function test_can_remove_stock()
    {
        $this->withoutExceptionHandling();
        $category = InventoryCategory::create(['name' => 'Hardware']);
        $item = InventoryItem::create([
            'category_id' => $category->id,
            'name' => 'Nail',
            'quantity' => 100
        ]);

        Sanctum::actingAs($this->user, ['*']);

        $response = $this->postJson("/api/inventory-items/{$item->id}/remove-stock", [
            'quantity' => 20,
            'remarks' => 'Usage'
        ]);

        $response->assertStatus(200)
            ->assertJson(['quantity' => 80]);

        $this->assertDatabaseHas('inventory_items', ['id' => $item->id, 'quantity' => 80]);
        $this->assertDatabaseHas('inventory_transactions', ['inventory_item_id' => $item->id, 'type' => 'out', 'quantity' => 20]);
    }

    public function test_prevent_negative_stock()
    {
        $category = InventoryCategory::create(['name' => 'Hardware']);
        $item = InventoryItem::create([
            'category_id' => $category->id,
            'name' => 'Bolt',
            'quantity' => 10
        ]);

        Sanctum::actingAs($this->user, ['*']);

        $response = $this->postJson("/api/inventory-items/{$item->id}/remove-stock", [
            'quantity' => 20 // More than available
        ]);

        $response->assertStatus(400); // Should be Bad Request

        $this->assertDatabaseHas('inventory_items', ['id' => $item->id, 'quantity' => 10]);
    }
}

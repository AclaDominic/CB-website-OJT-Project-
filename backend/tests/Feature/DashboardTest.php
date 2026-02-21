<?php

namespace Tests\Feature;

use App\Models\InventoryItem;
use App\Models\ProcurementRequest;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        Artisan::call('db:seed', ['--class' => 'RolePermissionSeeder']);
        $this->admin = User::factory()->create();
        $this->admin->assignRole('Admin');
    }

    /** @test */
    public function admin_can_fetch_dashboard_stats()
    {
        // Setup Data
        // 1. Low Stock Items (2 items)
        $category = \App\Models\InventoryCategory::create(['name' => 'Raw Materials']);
        InventoryItem::create(['category_id' => $category->id, 'name' => 'Low Item 1', 'quantity' => 2, 'threshold' => 5]);
        InventoryItem::create(['category_id' => $category->id, 'name' => 'Low Item 2', 'quantity' => 0, 'threshold' => 5]);
        InventoryItem::create(['category_id' => $category->id, 'name' => 'Good Item', 'quantity' => 10, 'threshold' => 5]);

        // 2. Pending Procurement (1 submitted, 1 processing)
        $project = Project::factory()->create(['status' => 'ongoing']);
        ProcurementRequest::create(['project_id' => $project->id, 'user_id' => $this->admin->id, 'status' => 'submitted']);
        ProcurementRequest::create(['project_id' => $project->id, 'user_id' => $this->admin->id, 'status' => 'processing']);
        ProcurementRequest::create(['project_id' => $project->id, 'user_id' => $this->admin->id, 'status' => 'draft']); // Should not count

        // 3. Active Projects (1 created above + create 1 more ongoing, 1 completed)
        Project::factory()->create(['status' => 'ongoing']);
        Project::factory()->create(['status' => 'completed']);

        // Execute
        $response = $this->actingAs($this->admin)->getJson('/api/admin/dashboard-stats');

        // Verify
        $response->assertStatus(200)
            ->assertJson([
                'low_stock_count' => 2,
                'pending_procurement_count' => 2,
                'active_projects_count' => 2,
            ])
            ->assertJsonStructure(['recent_procurement']);
    }

    /** @test */
    public function pm_can_only_see_own_requests_and_no_stock()
    {
        // 1. Setup Data
        $project = Project::factory()->create(['status' => 'ongoing']);

        // Own Request
        ProcurementRequest::create(['project_id' => $project->id, 'user_id' => $this->admin->id, 'status' => 'submitted']);

        // Other Request
        $otherUser = User::factory()->create();
        ProcurementRequest::create(['project_id' => $project->id, 'user_id' => $otherUser->id, 'status' => 'submitted']);

        // Inventory Setup
        $category = \App\Models\InventoryCategory::create(['name' => 'Raw Materials']);
        InventoryItem::create(['category_id' => $category->id, 'name' => 'Low Item', 'quantity' => 0, 'threshold' => 5]);

        // 2. Act as new PM (who is not the owner of above requests)
        $pm = User::factory()->create();
        $pm->assignRole('Project Manager');

        // Create PM's own request
        ProcurementRequest::create(['project_id' => $project->id, 'user_id' => $pm->id, 'status' => 'submitted']);

        $response = $this->actingAs($pm)->getJson('/api/admin/dashboard-stats');

        $response->assertStatus(200)
            ->assertJson([
                'low_stock_count' => 1, // PM has inventory.view so they see it
                'pending_procurement_count' => 1, // Only their own
            ]);
    }

    /** @test */
    public function staff_can_see_global_requests_and_stock()
    {
        // 1. Setup Data
        $category = \App\Models\InventoryCategory::create(['name' => 'Raw Materials']);
        InventoryItem::create(['category_id' => $category->id, 'name' => 'Low Item', 'quantity' => 0, 'threshold' => 5]);
        $project = Project::factory()->create(['status' => 'ongoing']);

        // Requests from various users
        ProcurementRequest::create(['project_id' => $project->id, 'user_id' => $this->admin->id, 'status' => 'submitted']);
        ProcurementRequest::create(['project_id' => $project->id, 'user_id' => User::factory()->create()->id, 'status' => 'processing']);

        // 2. Act as Staff
        $staff = User::factory()->create();
        $staff->assignRole('Staff');

        $response = $this->actingAs($staff)->getJson('/api/admin/dashboard-stats');

        $response->assertStatus(200)
            ->assertJson([
                'low_stock_count' => 1, // Visible
                'pending_procurement_count' => 2, // All global
            ]);
    }
}

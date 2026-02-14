<?php

namespace Tests\Feature;

use App\Models\ProcurementRequest;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProcurementWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected $pm;
    protected $staff;
    protected $admin;
    protected $project;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed Roles and Permissions
        Artisan::call('db:seed', ['--class' => 'RolePermissionSeeder']);

        // Create Users with Roles
        $this->pm = User::factory()->create();
        $this->pm->assignRole('Project Manager');

        $this->staff = User::factory()->create();
        $this->staff->assignRole('Staff');

        $this->admin = User::factory()->create();
        $this->admin->assignRole('Admin');

        // Create Ongoing Project
        $this->project = Project::factory()->create(['status' => 'ongoing']);
    }

    /** @test */
    public function procurement_happy_path_workflow()
    {
        // 1. PM Creates Draft
        $response = $this->actingAs($this->pm)->postJson('/api/procurement', [
            'project_id' => $this->project->id,
            'remarks' => 'Urgent materials',
            'items' => [
                ['name' => 'Cement', 'quantity' => 100, 'unit' => 'bags', 'notes' => 'Type 1'],
            ]
        ]);

        $response->assertStatus(201);
        $requestId = $response->json('id');
        $this->assertDatabaseHas('procurement_requests', ['id' => $requestId, 'status' => 'draft']);

        // 2. PM Submits Draft
        $response = $this->actingAs($this->pm)->postJson("/api/procurement/{$requestId}/status", [
            'status' => 'submitted'
        ]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('procurement_requests', ['id' => $requestId, 'status' => 'submitted']);

        // 3. Staff Starts Processing
        $response = $this->actingAs($this->staff)->postJson("/api/procurement/{$requestId}/status", [
            'status' => 'processing',
            'supplier_notes' => 'Ordered from ACME',
            'expected_arrival_date' => now()->addDays(3)->format('Y-m-d')
        ]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('procurement_requests', ['id' => $requestId, 'status' => 'processing']);

        // 4. Staff Completes
        $response = $this->actingAs($this->staff)->postJson("/api/procurement/{$requestId}/status", [
            'status' => 'completed'
        ]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('procurement_requests', ['id' => $requestId, 'status' => 'completed']);

        // 5. Staff Archives
        $response = $this->actingAs($this->staff)->postJson("/api/procurement/{$requestId}/status", [
            'status' => 'archived'
        ]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('procurement_requests', ['id' => $requestId, 'status' => 'archived']);
    }

    /** @test */
    public function staff_cannot_create_or_submit_request()
    {
        // Staff try creating
        $response = $this->actingAs($this->staff)->postJson('/api/procurement', [
            'project_id' => $this->project->id,
            'items' => [['name' => 'Test', 'quantity' => 1, 'unit' => 'pcs']]
        ]);
        $response->assertStatus(403);

        // PM creates draft
        $request = ProcurementRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $this->pm->id,
            'status' => 'draft',
        ]);

        // Staff try submitting
        $response = $this->actingAs($this->staff)->postJson("/api/procurement/{$request->id}/status", [
            'status' => 'submitted'
        ]);
        $response->assertStatus(403);
    }

    /** @test */
    public function pm_cannot_process_or_complete_request()
    {
        // Setup submitted request
        $request = ProcurementRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $this->pm->id,
            'status' => 'submitted',
        ]);

        // PM try processing
        $response = $this->actingAs($this->pm)->postJson("/api/procurement/{$request->id}/status", [
            'status' => 'processing'
        ]);
        $response->assertStatus(403);
    }

    /** @test */
    public function cannot_skip_steps_in_workflow()
    {
        $request = ProcurementRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $this->pm->id,
            'status' => 'draft',
        ]);

        // Try Draft -> Processing (Skip Submitted)
        $response = $this->actingAs($this->staff)->postJson("/api/procurement/{$request->id}/status", [
            'status' => 'processing'
        ]);
        // Should be 400 Bad Request (Invalid transition) OR 403 Forbidden (Staff can't touch draft via status usually, but pure logic check first)
        // Our controller checks status match first: "Invalid status transition" 400
        $response->assertStatus(400);
    }

    /** @test */
    public function cannot_reverse_status()
    {
        $request = ProcurementRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $this->pm->id,
            'status' => 'submitted',
        ]);

        // Try Submitted -> Draft
        $response = $this->actingAs($this->pm)->postJson("/api/procurement/{$request->id}/status", [
            'status' => 'draft'
        ]);
        // Controller doesn't have a case for 'draft' in switch, defaults to "Invalid status" 400
        $response->assertStatus(400);
    }

    /** @test */
    public function admin_is_read_only_for_status_changes()
    {
        $request = ProcurementRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $this->pm->id,
            'status' => 'draft',
        ]);

        // Admin try creating
        $response = $this->actingAs($this->admin)->postJson('/api/procurement', [
            'project_id' => $this->project->id,
            'items' => [['name' => 'Test', 'quantity' => 1, 'unit' => 'pcs']]
        ]);
        $response->assertStatus(403);

        // Admin try changing status
        $response = $this->actingAs($this->admin)->postJson("/api/procurement/{$request->id}/status", [
            'status' => 'submitted'
        ]);
        $response->assertStatus(403);
    }

    /** @test */
    public function pm_cannot_edit_submitted_request()
    {
        $request = ProcurementRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $this->pm->id,
            'status' => 'submitted',
            'remarks' => 'Original remarks'
        ]);

        $response = $this->actingAs($this->pm)->putJson("/api/procurement/{$request->id}", [
            'remarks' => 'Updated remarks'
        ]);

        // Controller returns 400 for non-draft status update
        $response->assertStatus(400);
    }

    /** @test */
    public function cannot_modify_completed_request()
    {
        $request = ProcurementRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $this->pm->id,
            'status' => 'completed',
        ]);

        // Attempt update as PM
        $response = $this->actingAs($this->pm)->putJson("/api/procurement/{$request->id}", [
            'remarks' => 'Updated remarks'
        ]);
        $response->assertStatus(400);

        // Attempt update as Staff
        $response = $this->actingAs($this->staff)->putJson("/api/procurement/{$request->id}", [
            'remarks' => 'Updated remarks'
        ]);
        // Staff unauthorized to update anyway (only owner can update draft)
        $response->assertStatus(403);
    }

    /** @test */
    public function cannot_create_request_for_completed_project()
    {
        $completedProject = Project::factory()->create(['status' => 'completed']);

        $response = $this->actingAs($this->pm)->postJson('/api/procurement', [
            'project_id' => $completedProject->id,
            'items' => [['name' => 'Test', 'quantity' => 1, 'unit' => 'pcs']]
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['project_id']);
    }

    /** @test */
    public function cannot_create_request_for_nonexistent_project()
    {
        $response = $this->actingAs($this->pm)->postJson('/api/procurement', [
            'project_id' => 99999, // Non-existent
            'items' => [['name' => 'Test', 'quantity' => 1, 'unit' => 'pcs']]
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['project_id']);
    }

    /** @test */
    public function staff_needs_permission_to_process()
    {
        $request = ProcurementRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $this->pm->id,
            'status' => 'submitted',
        ]);

        // Remove permission from Staff role
        $role = Role::findByName('Staff');
        $role->revokePermissionTo('procurement.process');

        // Clear cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Attempt to process
        $response = $this->actingAs($this->staff)->postJson("/api/procurement/{$request->id}/status", [
            'status' => 'processing'
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function cannot_process_request_twice()
    {
        $request = ProcurementRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $this->pm->id,
            'status' => 'processing', // Already processing
        ]);

        // Attempt to set to processing again
        $response = $this->actingAs($this->staff)->postJson("/api/procurement/{$request->id}/status", [
            'status' => 'processing'
        ]);

        // Should return 400 as current status is not 'submitted'
        $response->assertStatus(400);
    }
    /** @test */
    public function pm_can_delete_own_draft()
    {
        $request = ProcurementRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $this->pm->id,
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->pm)->deleteJson("/api/procurement/{$request->id}");
        $response->assertStatus(200);
        $this->assertDatabaseMissing('procurement_requests', ['id' => $request->id]);
    }

    /** @test */
    public function se_can_delete_own_draft()
    {
        // Setup SE user
        $se = User::factory()->create();
        $se->assignRole('Site Engineer');

        $request = ProcurementRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $se->id,
            'status' => 'draft',
        ]);

        $response = $this->actingAs($se)->deleteJson("/api/procurement/{$request->id}");
        $response->assertStatus(200);
        $this->assertDatabaseMissing('procurement_requests', ['id' => $request->id]);
    }

    /** @test */
    public function cannot_delete_others_draft()
    {
        $request = ProcurementRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $this->pm->id,
            'status' => 'draft',
        ]);

        // Another PM tries to delete
        $otherPm = User::factory()->create();
        $otherPm->assignRole('Project Manager');

        $response = $this->actingAs($otherPm)->deleteJson("/api/procurement/{$request->id}");
        $response->assertStatus(403);
        $this->assertDatabaseHas('procurement_requests', ['id' => $request->id]);
    }

    /** @test */
    public function cannot_delete_non_draft_request()
    {
        $request = ProcurementRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $this->pm->id,
            'status' => 'submitted',
        ]);

        $response = $this->actingAs($this->pm)->deleteJson("/api/procurement/{$request->id}");
        $response->assertStatus(400); // Bad Request
        $this->assertDatabaseHas('procurement_requests', ['id' => $request->id]);
    }

    /** @test */
    public function staff_cannot_delete_draft()
    {
        // Staff usually don't create drafts, but if they did or tried to delete PM's draft
        $request = ProcurementRequest::create([
            'project_id' => $this->project->id,
            'user_id' => $this->pm->id,
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->staff)->deleteJson("/api/procurement/{$request->id}");
        $response->assertStatus(403);
    }
}

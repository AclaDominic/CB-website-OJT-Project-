<?php

namespace Tests\Feature\Api\System;

use App\Models\User;
use App\Models\ProcurementRequest;
use App\Models\Project;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProcurementReportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Reset permissions config
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        Permission::findOrCreate('procurement.report');
        Permission::findOrCreate('procurement.view');

        $adminRole = Role::findOrCreate('Admin');
        $adminRole->givePermissionTo('procurement.report');

        $staffRole = Role::findOrCreate('Staff');
        $staffRole->givePermissionTo('procurement.report');

        $pmRole = Role::findOrCreate('Project Manager');
        // Intentionally NOT giving PM the report permission based on previous seeder, 
        // to test unauthorized access. (Or if they should have it, this tests the unpermitted state).
    }

    public function test_unauthenticated_user_cannot_access_report()
    {
        $response = $this->getJson('/api/procurement/report');
        $response->assertStatus(401);
    }

    public function test_unauthorized_user_cannot_access_report()
    {
        $user = User::factory()->create();
        $user->assignRole('Project Manager'); // PM doesn't have procurement.report in our test setup

        $response = $this->actingAs($user)->getJson('/api/procurement/report');
        $response->assertStatus(403);
    }

    public function test_authorized_user_receives_404_when_no_data()
    {
        $user = User::factory()->create();
        $user->assignRole('Admin');

        $response = $this->actingAs($user)->getJson('/api/procurement/report');

        $response->assertStatus(404)
            ->assertJsonPath('message', 'No procurement requests found for the selected criteria.');
    }

    public function test_authorized_user_can_download_report_with_data()
    {
        $user = User::factory()->create();
        $user->assignRole('Staff');

        $project = Project::factory()->create();
        ProcurementRequest::factory()->create([
            'user_id' => $user->id,
            'project_id' => $project->id,
            'status' => ProcurementRequest::STATUS_DRAFT
        ]);

        $response = $this->actingAs($user)->getJson('/api/procurement/report');

        $response->assertStatus(200);
        $this->assertEquals('application/pdf', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('procurement-report-', $response->headers->get('Content-Disposition'));
    }

    public function test_report_filtration_by_project()
    {
        $user = User::factory()->create();
        $user->assignRole('Admin');

        $project1 = Project::factory()->create();
        $project2 = Project::factory()->create();

        ProcurementRequest::factory()->create(['user_id' => $user->id, 'project_id' => $project1->id]);

        $response = $this->actingAs($user)->getJson("/api/procurement/report?project_id={$project2->id}");

        // Should be 404 because no requests exist for project 2
        $response->assertStatus(404);

        $responseValid = $this->actingAs($user)->getJson("/api/procurement/report?project_id={$project1->id}");
        $responseValid->assertStatus(200);
    }
}

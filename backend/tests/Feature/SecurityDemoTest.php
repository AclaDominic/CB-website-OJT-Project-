<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class SecurityDemoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup Roles
        $adminRole = Role::create(['name' => 'Admin']);
        $userRole = Role::create(['name' => 'Staff']);
        Permission::create(['name' => 'projects.delete']);
        $adminRole->givePermissionTo('projects.delete');
    }

    /** @test */
    public function public_users_cannot_access_admin_panel()
    {
        $response = $this->getJson('/api/system/users');

        // Expect: 401 Unauthorized (Because they are not logged in)
        $response->assertStatus(401);
    }

    /** @test */
    public function staff_cannot_delete_projects_rbac_protection()
    {
        $user = User::factory()->create();
        $user->assignRole('Staff');

        $project = Project::factory()->create();

        // Acting as a Staff member (Login)
        $response = $this->actingAs($user)->deleteJson("/api/projects/{$project->id}");

        // Expect: 403 Forbidden (RBAC working!)
        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_delete_projects()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        $project = Project::factory()->create();

        // Acting as Admin
        $response = $this->actingAs($admin)->deleteJson("/api/projects/{$project->id}");

        // Expect: 204 No Content (Success)
        $response->assertStatus(204);
    }

    /** @test */
    public function public_api_does_not_leak_hidden_data()
    {
        $user = User::factory()->create([
            'password' => 'secret123', // This should NEVER be returned
        ]);

        $response = $this->actingAs($user)->getJson('/api/user');

        // Verify that 'password' is NOT in the JSON response
        $response->assertJsonMissing(['password']);
        $response->assertJsonMissing(['remember_token']);

        $response->assertStatus(200);
    }
}

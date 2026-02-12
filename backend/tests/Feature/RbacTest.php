<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Support\Facades\Artisan;
use Laravel\Sanctum\Sanctum;

class RbacTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed roles and permissions
        $this->seed(RolePermissionSeeder::class);
    }

    // --- Admin Tests ---

    public function test_admin_can_access_user_management()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        Sanctum::actingAs($admin, ['*']);

        $response = $this->getJson('/api/admin/users');

        $response->assertStatus(200);
    }

    public function test_admin_can_create_new_user()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        Sanctum::actingAs($admin, ['*']);

        $response = $this->postJson('/api/admin/users', [
            'name' => 'New Staff',
            'email' => 'newstaff@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'Staff'
        ]);

        $response->assertStatus(201);
    }

    // --- Project Manager Tests ---

    public function test_project_manager_can_access_projects()
    {
        $pm = User::factory()->create();
        $pm->assignRole('Project Manager');

        Sanctum::actingAs($pm, ['*']);

        $response = $this->getJson('/api/projects');

        $response->assertStatus(200);
    }

    public function test_project_manager_cannot_access_admin_routes()
    {
        $pm = User::factory()->create();
        $pm->assignRole('Project Manager');

        Sanctum::actingAs($pm, ['*']);

        // Attempt to access user management
        $response = $this->getJson('/api/admin/users');

        // Should be Forbidden
        $response->assertStatus(403);
    }

    // --- Staff Tests ---

    public function test_staff_can_view_cms_content_services()
    {
        $staff = User::factory()->create();
        $staff->assignRole('Staff');

        Sanctum::actingAs($staff, ['*']);

        $response = $this->getJson('/api/services');

        $response->assertStatus(200);
    }

    public function test_staff_cannot_access_admin_routes()
    {
        $staff = User::factory()->create();
        $staff->assignRole('Staff');

        Sanctum::actingAs($staff, ['*']);

        $response = $this->getJson('/api/admin/users');

        $response->assertStatus(403);
    }

    public function test_staff_cannot_create_project()
    {
        $staff = User::factory()->create();
        $staff->assignRole('Staff');

        Sanctum::actingAs($staff, ['*']);

        // Attempt to create a project
        $response = $this->postJson('/api/projects', [
            'name' => 'Unauthorized Project',
            'location' => 'Nowhere',
            'year' => '2024',
            'scope' => 'Hacking',
            'status' => 'ongoing'
        ]);

        // Ideally this should be 403.
        // If the system is insecure, it might return 201.
        // We actally assert 403 to PROVE it is secure or failed if it isn't.
        $response->assertStatus(403);
    }

    // --- Guest Tests ---

    public function test_guest_cannot_access_protected_routes()
    {
        $response = $this->getJson('/api/admin/users');

        $response->assertStatus(401); // Unauthorized
    }
}

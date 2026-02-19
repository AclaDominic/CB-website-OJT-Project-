<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use Database\Seeders\RolePermissionSeeder;

class SystemCapabilitiesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    // --- Public Access Tests ---

    public function test_can_access_public_pages()
    {
        // Check public API endpoints
        $response = $this->getJson('/api/services');
        $response->assertStatus(200);

        $response = $this->getJson('/api/projects');
        $response->assertStatus(200);
    }

    public function test_can_submit_inquiry()
    {
        $response = $this->postJson('/api/inquiries', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'subject' => 'Project Inquiry',
            'message' => 'I would like to discuss a project.'
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'email' => 'john@example.com',
                'subject' => 'Project Inquiry'
            ]);

        $this->assertDatabaseHas('inquiries', [
            'email' => 'john@example.com'
        ]);
    }

    // --- CMS Management Tests (Admin) ---

    public function test_admin_can_manage_services()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');
        Sanctum::actingAs($admin, ['*']);

        // Create
        $response = $this->postJson('/api/services', [
            'title' => 'New Service',
            'description' => 'Service Description',
            'type' => 'primary', // Required: primary or secondary
        ]);
        $response->assertStatus(201);
        $id = $response->json('id');

        // Update
        $response = $this->putJson("/api/services/{$id}", [
            'title' => 'Updated Service',
            'description' => 'Updated Description',
            'type' => 'secondary',
        ]);
        $response->assertStatus(200);

        // Delete (Expect 204 No Content)
        $response = $this->deleteJson("/api/services/{$id}");
        $response->assertStatus(204);
    }

    public function test_admin_can_manage_projects()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');
        Sanctum::actingAs($admin, ['*']);

        // Create
        $response = $this->postJson('/api/projects', [
            'name' => 'Skyscraper A',
            'location' => 'City Center',
            'year' => '2025',
            'scope' => 'Construction',
            'status' => 'ongoing' // Required: ongoing or completed
        ]);
        $response->assertStatus(201);
        $id = $response->json('id');

        // Update
        $response = $this->putJson("/api/projects/{$id}", [
            'name' => 'Skyscraper B',
            'location' => 'City Center',
            'year' => '2025',
            'scope' => 'Construction',
            'status' => 'completed'
        ]);
        $response->assertStatus(200);

        // Delete (Expect 204 No Content)
        $response = $this->deleteJson("/api/projects/{$id}");
        $response->assertStatus(204);
    }

    // --- User Management Tests ---

    public function test_admin_can_manage_users()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');
        Sanctum::actingAs($admin, ['*']);

        // Create User (Route is /api/admin/users)
        $response = $this->postJson('/api/admin/users', [
            'name' => 'Test Staff',
            'email' => 'teststaff@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'Staff'
        ]);
        $response->assertStatus(201);
        $userId = $response->json('id');

        // Update User
        $response = $this->putJson("/api/admin/users/{$userId}", [
            // API only allows updating role in the update method according to UserController::update
            'role' => 'Project Manager'
        ]);
        $response->assertStatus(200);

        // Check if role was updated
        $this->assertTrue(User::find($userId)->hasRole('Project Manager'));
    }
}

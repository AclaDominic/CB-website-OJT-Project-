<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Database\Seeders\RolePermissionSeeder;
use Laravel\Sanctum\Sanctum;

class RoleManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed roles and permissions
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_admin_role_cannot_be_modified_or_deleted()
    {
        // 1. Setup an Admin User
        $adminUser = User::factory()->create();
        $adminUser->assignRole('Admin');

        $adminRole = Role::where('name', 'Admin')->firstOrFail();
        $staffRole = Role::where('name', 'Staff')->firstOrFail();

        Sanctum::actingAs($adminUser, ['*']);

        // 2. Attempt to Update Admin Role (Should Fail)
        $updateAdminResponse = $this->putJson("/api/system/roles/{$adminRole->id}", [
            'name' => 'Admin2',
            'permissions' => []
        ]);
        $updateAdminResponse->assertStatus(403);
        $updateAdminResponse->assertJson(['message' => 'The core Admin role cannot be modified.']);

        // 3. Attempt to Delete Admin Role (Should Fail)
        $deleteAdminResponse = $this->deleteJson("/api/system/roles/{$adminRole->id}");
        $deleteAdminResponse->assertStatus(403);
        $deleteAdminResponse->assertJson(['message' => 'The core Admin role cannot be deleted.']);

        // 4. Verify that another role CAN be modified and deleted
        $updateStaffResponse = $this->putJson("/api/system/roles/{$staffRole->id}", [
            'name' => 'Staff Editor',
            'permissions' => []
        ]);
        $updateStaffResponse->assertStatus(200);

        $deleteStaffResponse = $this->deleteJson("/api/system/roles/{$staffRole->id}");
        $deleteStaffResponse->assertStatus(200);
    }
}

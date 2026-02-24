<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class DatabaseConsistencyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Run seeders for testing the system's baseline
        $this->artisan('db:seed');
    }

    public function test_critical_database_tables_exist()
    {
        $criticalTables = [
            'users',
            'roles',
            'permissions',
            'role_has_permissions',
            'model_has_roles',
            'organization_members',
            'page_contents',
            'projects',
            'services',
            'system_alerts',
            'procurement_requests',
        ];

        foreach ($criticalTables as $table) {
            $this->assertTrue(Schema::hasTable($table), "Critical table '{$table}' is missing from the database schema.");
        }
    }

    public function test_baseline_roles_are_seeded()
    {
        $expectedRoles = ['Admin', 'Project Manager', 'Staff'];

        foreach ($expectedRoles as $role) {
            $this->assertDatabaseHas('roles', ['name' => $role]);
        }
    }

    public function test_baseline_admin_user_is_seeded()
    {
        // There should be at least one user seeded and they should have the 'Admin' role
        $this->assertTrue(User::count() > 0, "No baseline users were seeded.");

        $adminUsers = User::role('Admin')->get();
        $this->assertTrue($adminUsers->count() > 0, "No user possesses the mandatory 'Admin' role after seeding.");
    }
}

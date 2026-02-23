<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class BackupRbacTest extends TestCase
{
    use RefreshDatabase;

    protected $adminUser;
    protected $normalUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);
        $this->artisan('db:seed', ['--class' => 'BackupPermissionsSeeder']);

        // Create Admin (Super)
        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole('Admin');

        // Ensure Admin has specifically these permissions (handled by seeder and role)

        // Create Normal User
        $this->normalUser = User::factory()->create();
        $this->normalUser->assignRole('Staff');
    }

    public function test_view_backups_requires_permission()
    {
        $response = $this->actingAs($this->normalUser)->getJson('/api/system/backups');
        $response->assertStatus(403);

        $responseAdmin = $this->actingAs($this->adminUser)->getJson('/api/system/backups');
        $responseAdmin->assertStatus(200);
    }

    public function test_create_backups_requires_permission()
    {
        $response = $this->actingAs($this->normalUser)->postJson('/api/system/backups');
        $response->assertStatus(403);

        // Admin can trigger
        $responseAdmin = $this->actingAs($this->adminUser)->postJson('/api/system/backups');
        $responseAdmin->assertStatus(200);
    }

    public function test_download_backups_requires_permission()
    {
        // Mock a backup file
        Storage::fake('local');
        $backupName = config('backup.backup.name');
        Storage::disk('local')->put("{$backupName}/test_backup.zip", 'dummy content');

        $response = $this->actingAs($this->normalUser)->getJson("/api/system/backups/test_backup.zip");
        $response->assertStatus(403);

        $responseAdmin = $this->actingAs($this->adminUser)->getJson("/api/system/backups/test_backup.zip");
        $responseAdmin->assertStatus(200);
    }

    public function test_delete_backups_requires_permission()
    {
        // Mock a backup file
        Storage::fake('local');
        $backupName = config('backup.backup.name');
        Storage::disk('local')->put("{$backupName}/delete_backup.zip", 'dummy content');

        $response = $this->actingAs($this->normalUser)->deleteJson("/api/system/backups/delete_backup.zip");
        $response->assertStatus(403);

        $responseAdmin = $this->actingAs($this->adminUser)->deleteJson("/api/system/backups/delete_backup.zip");
        $responseAdmin->assertStatus(200);
    }
}

<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\SystemAlert;
use Spatie\Permission\Models\Role;

class SystemAlertsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup Roles
        Role::create(['name' => 'Admin']);
        Role::create(['name' => 'Staff']);
    }

    public function test_public_contact_form_failure_creates_minor_alert()
    {
        // To simulate a DB failure, we pass a message that is intentionally too large, 
        // exceeding the typical text/varchar column limit, to trigger a PDOException 
        // when Eloquent tries to insert it, or we can use a mock that works with facades.
        // A cleaner way in Laravel 11 is to mock the model's query builder or just dispatch an event.
        // Let's explicitly trigger the exception by spying on the Inquiry model creation.

        $this->mock(\App\Models\Inquiry::class, function ($mock) {
            $mock->shouldReceive('unguarded')->andReturn(true);
            $mock->shouldReceive('create')->andThrow(new \Exception('Simulated database connection failed'));
        })->makePartial();

        // Still having instance mocking issues with static `create()` calls in controllers. 
        // Better approach: temporarily change the DB config or Drop the table in memory.
        \Illuminate\Support\Facades\Schema::drop('inquiries');

        // Submit to inquiry endpoint. It will pass validation but fail on Inquiry::create() due to missing table.
        $response = $this->postJson('/api/inquiries', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'message' => 'Help me!',
            'subject' => 'Issue',
        ]);

        // Restore the table for subsequent tests
        \Illuminate\Support\Facades\Artisan::call('migrate');

        $response->assertStatus(500)
            ->assertJson(['message' => 'An error occurred while processing your request. Please try again later.']);

        // Assert alert was created in DB
        $this->assertDatabaseHas('system_alerts', [
            'type' => 'minor',
            'message' => 'Failed to process contact inquiry',
        ]);

        $alert = SystemAlert::first();
        $this->assertEquals('minor', $alert->type);
        $this->assertFalse($alert->resolved);
        $this->assertStringContainsString('no such table: inquiries', $alert->context['error']);
    }

    public function test_unhandled_exception_on_private_route_creates_critical_alert()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        // We can force a route to throw an exception for testing
        \Illuminate\Support\Facades\Route::get('/api/admin/force-error', function () {
            throw new \Exception('Unexpected Server Exploded');
        })->middleware(['auth:sanctum', 'role:Admin']);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/force-error');

        // It should return 500
        $response->assertStatus(500);

        // Verify a critical alert was logged
        $this->assertDatabaseHas('system_alerts', [
            'type' => 'critical',
            'message' => 'Unexpected Server Exploded',
        ]);

        $alert = SystemAlert::first();
        $this->assertEquals('critical', $alert->type);
        $this->assertEquals($admin->id, $alert->context['user_id']);
        $this->assertStringContainsString('/api/admin/force-error', $alert->context['url']);
    }

    public function test_dashboard_api_returns_active_alerts_and_status()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        // Create one minor and one critical alert
        SystemAlert::create(['type' => 'minor', 'message' => 'test minor']);
        SystemAlert::create(['type' => 'critical', 'message' => 'test critical']);

        $response = $this->actingAs($admin)->getJson('/api/admin/dashboard-stats');

        $response->assertStatus(200)
            ->assertJson([
                'system_status' => 'Critical Problem',
            ])
            ->assertJsonCount(2, 'system_alerts');
    }

    public function test_admin_can_resolve_alerts()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        $alert = SystemAlert::create(['type' => 'minor', 'message' => 'test alert', 'resolved' => false]);

        $this->assertFalse($alert->resolved);

        $response = $this->actingAs($admin)->postJson("/api/admin/system-alerts/{$alert->id}/resolve");

        $response->assertStatus(200);

        $this->assertDatabaseHas('system_alerts', [
            'id' => $alert->id,
            'resolved' => true,
            'resolved_by' => $admin->id,
        ]);
    }

    public function test_unauthenticated_user_cannot_resolve_alerts()
    {
        $alert = SystemAlert::create(['type' => 'minor', 'message' => 'unresolved alert', 'resolved' => false]);

        $response = $this->postJson("/api/admin/system-alerts/{$alert->id}/resolve");

        $response->assertStatus(401);

        // Ensure it is still unresolved
        $this->assertDatabaseHas('system_alerts', [
            'id' => $alert->id,
            'resolved' => false,
        ]);
    }

    public function test_staff_cannot_resolve_alerts()
    {
        $staff = User::factory()->create();
        $staff->assignRole('Staff');

        $alert = SystemAlert::create(['type' => 'critical', 'message' => 'critical alert', 'resolved' => false]);

        $response = $this->actingAs($staff)->postJson("/api/admin/system-alerts/{$alert->id}/resolve");

        // Should be forbidden
        $response->assertStatus(403);

        $this->assertDatabaseHas('system_alerts', [
            'id' => $alert->id,
            'resolved' => false,
        ]);
    }

    public function test_system_status_is_minor_problem_when_only_minor_alerts_exist()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        SystemAlert::create(['type' => 'minor', 'message' => 'a minor issue']);

        $response = $this->actingAs($admin)->getJson('/api/admin/dashboard-stats');

        $response->assertStatus(200)
            ->assertJson(['system_status' => 'Minor Problem']);
    }

    public function test_critical_status_takes_priority_over_minor()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        SystemAlert::create(['type' => 'minor', 'message' => 'minor issue']);
        SystemAlert::create(['type' => 'critical', 'message' => 'critical issue']);

        $response = $this->actingAs($admin)->getJson('/api/admin/dashboard-stats');

        $response->assertStatus(200)
            ->assertJson(['system_status' => 'Critical Problem']);
    }

    public function test_system_status_is_operational_when_all_alerts_resolved()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        SystemAlert::create(['type' => 'critical', 'message' => 'old issue', 'resolved' => true, 'resolved_by' => $admin->id, 'resolved_at' => now()]);

        $response = $this->actingAs($admin)->getJson('/api/admin/dashboard-stats');

        $response->assertStatus(200)
            ->assertJson(['system_status' => 'System Operational'])
            ->assertJsonCount(0, 'system_alerts');
    }

    public function test_resolved_alerts_do_not_appear_in_dashboard_list()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        // One resolved, one active
        SystemAlert::create(['type' => 'critical', 'message' => 'resolved issue', 'resolved' => true, 'resolved_by' => $admin->id, 'resolved_at' => now()]);
        SystemAlert::create(['type' => 'minor', 'message' => 'active issue', 'resolved' => false]);

        $response = $this->actingAs($admin)->getJson('/api/admin/dashboard-stats');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'system_alerts')
            ->assertJson(['system_alerts' => [['message' => 'active issue']]]);
    }

    public function test_resolving_non_existent_alert_returns_404()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        $response = $this->actingAs($admin)->postJson('/api/admin/system-alerts/99999/resolve');

        $response->assertStatus(404);
    }

    public function test_resolving_already_resolved_alert_is_idempotent()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        $alert = SystemAlert::create([
            'type' => 'minor',
            'message' => 'already resolved',
            'resolved' => true,
            'resolved_by' => $admin->id,
            'resolved_at' => now(),
        ]);

        // Calling resolve again should not crash
        $response = $this->actingAs($admin)->postJson("/api/admin/system-alerts/{$alert->id}/resolve");

        $response->assertStatus(200);

        // The alert should still be resolved and with the same data
        $this->assertDatabaseHas('system_alerts', [
            'id' => $alert->id,
            'resolved' => true,
        ]);
    }

    public function test_critical_alert_context_captures_user_and_url()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        \Illuminate\Support\Facades\Route::get('/api/admin/context-test', function () {
            throw new \Exception('Context Test Error');
        })->middleware(['auth:sanctum', 'role:Admin']);

        $this->actingAs($admin)->getJson('/api/admin/context-test');

        $alert = SystemAlert::where('type', 'critical')->first();

        $this->assertNotNull($alert);
        $this->assertArrayHasKey('user_id', $alert->context);
        $this->assertArrayHasKey('url', $alert->context);
        $this->assertArrayHasKey('file', $alert->context);
        $this->assertArrayHasKey('line', $alert->context);
        $this->assertArrayHasKey('method', $alert->context);
        $this->assertEquals($admin->id, $alert->context['user_id']);
        $this->assertStringContainsString('context-test', $alert->context['url']);
    }

    public function test_simulate_alerts_command_creates_exactly_one_minor_and_one_critical()
    {
        \Illuminate\Support\Facades\Artisan::call('simulate:alerts');

        $this->assertDatabaseHas('system_alerts', ['type' => 'minor', 'resolved' => false]);
        $this->assertDatabaseHas('system_alerts', ['type' => 'critical', 'resolved' => false]);

        $totalCreated = SystemAlert::count();
        $this->assertEquals(2, $totalCreated);
    }
}

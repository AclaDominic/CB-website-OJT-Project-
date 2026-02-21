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
}

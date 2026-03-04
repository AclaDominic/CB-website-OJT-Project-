<?php

namespace Tests\Feature;

use App\Models\Faq;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class FaqEndpointTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create(['name' => 'Admin']);
        $staffRole = Role::create(['name' => 'Staff']);
        Permission::create(['name' => 'cms.edit']);
        $adminRole->givePermissionTo('cms.edit');
    }

    /** @test */
    public function public_can_fetch_faqs()
    {
        Faq::create(['question' => 'Q1', 'answer' => 'A1']);

        $response = $this->getJson('/api/faqs');

        $response->assertStatus(200)
            ->assertJsonCount(1);
    }

    /** @test */
    public function unauthenticated_cannot_create_faq()
    {
        $response = $this->postJson('/api/faqs', [
            'question' => 'New Q',
            'answer' => 'New A'
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function authenticated_without_permission_cannot_create_faq()
    {
        $user = User::factory()->create();
        $user->assignRole('Staff');

        $response = $this->actingAs($user)->postJson('/api/faqs', [
            'question' => 'New Q',
            'answer' => 'New A'
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function permitted_user_can_create_faq()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        $response = $this->actingAs($admin)->postJson('/api/faqs', [
            'question' => 'New Q',
            'answer' => 'New A'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('faqs', ['question' => 'New Q']);
    }

    /** @test */
    public function permitted_user_can_update_faq()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        $faq = Faq::create(['question' => 'Old Q', 'answer' => 'Old A']);

        $response = $this->actingAs($admin)->putJson("/api/faqs/{$faq->id}", [
            'question' => 'Updated Q',
            'answer' => 'Updated A'
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('faqs', ['question' => 'Updated Q']);
    }

    /** @test */
    public function permitted_user_can_delete_faq()
    {
        $admin = User::factory()->create();
        $admin->assignRole('Admin');

        $faq = Faq::create(['question' => 'Delete Me', 'answer' => 'Please']);

        $response = $this->actingAs($admin)->deleteJson("/api/faqs/{$faq->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('faqs', ['question' => 'Delete Me']);
    }
}

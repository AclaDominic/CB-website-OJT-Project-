<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\OrganizationMember;
use Spatie\Permission\Models\Permission;

class OrganizationMemberTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        // Create required permission
        Permission::create(['name' => 'cms.edit']);

        // Create an admin user with cms.edit permission
        $this->admin = User::factory()->create();
        $this->admin->givePermissionTo('cms.edit');
    }

    public function test_public_can_fetch_organization_members()
    {
        OrganizationMember::factory()->count(3)->create();

        $response = $this->getJson('/api/organization-members');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_admin_can_create_member_without_parent()
    {
        $payload = [
            'name' => 'John Doe',
            'role' => 'Manager',
            'category' => 'management',
            'order' => 1,
            'parent_id' => null,
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/organization-members', $payload);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'John Doe', 'parent_id' => null]);

        $this->assertDatabaseHas('organization_members', [
            'name' => 'John Doe',
            'parent_id' => null
        ]);
    }

    public function test_admin_can_create_member_with_valid_parent()
    {
        $boss = OrganizationMember::factory()->create(['category' => 'leadership']);

        $payload = [
            'name' => 'Jane Smith',
            'role' => 'Assistant',
            'category' => 'staff',
            'order' => 1,
            'parent_id' => $boss->id
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/organization-members', $payload);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Jane Smith', 'parent_id' => $boss->id]);

        $this->assertDatabaseHas('organization_members', [
            'name' => 'Jane Smith',
            'parent_id' => $boss->id
        ]);
    }

    public function test_cannot_create_member_with_invalid_parent_id()
    {
        $payload = [
            'name' => 'Invalid User',
            'role' => 'Staff',
            'category' => 'staff',
            'order' => 1,
            'parent_id' => 99999 // Non-existent ID
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/organization-members', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['parent_id']);
    }

    public function test_admin_can_update_member_parent_id()
    {
        $boss1 = OrganizationMember::factory()->create();
        $boss2 = OrganizationMember::factory()->create();
        $employee = OrganizationMember::factory()->create(['parent_id' => $boss1->id]);

        $payload = [
            'parent_id' => $boss2->id
        ];

        $response = $this->actingAs($this->admin)->putJson("/api/organization-members/{$employee->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonFragment(['parent_id' => $boss2->id]);

        $this->assertDatabaseHas('organization_members', [
            'id' => $employee->id,
            'parent_id' => $boss2->id
        ]);
    }

    public function test_cannot_assign_duplicate_order_in_same_category()
    {
        OrganizationMember::factory()->create([
            'category' => 'staff',
            'order' => 5
        ]);

        $payload = [
            'name' => 'Clone',
            'role' => 'Tester',
            'category' => 'staff',
            'order' => 5
        ];

        $response = $this->actingAs($this->admin)->postJson('/api/organization-members', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['order']);
    }
}

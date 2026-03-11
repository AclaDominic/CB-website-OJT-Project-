<?php

namespace Tests\Feature\Api\Cms;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use App\Models\User;
use App\Models\CompanyProfile;
use App\Models\ProfileDownloadLink;

class CompanyProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Give super admin all permissions logic might interfere or not, we just ensure it exists
        $permission = Permission::findOrCreate('cms.manage-company-profile');
    }

    public function test_unauthenticated_cannot_access()
    {
        $this->getJson('/api/company-profile')->assertStatus(401);
    }

    public function test_unauthorized_cannot_access()
    {
        $user = User::factory()->create();
        // User without cms.manage-company-profile permission
        $this->actingAs($user)->getJson('/api/company-profile')->assertStatus(403);
    }

    public function test_authorized_user_can_upload_profiles()
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $user->givePermissionTo('cms.manage-company-profile');

        $publicPdf = UploadedFile::fake()->create('public.pdf', 100, 'application/pdf');
        $fullPdf = UploadedFile::fake()->create('full.pdf', 500, 'application/pdf');

        $response = $this->actingAs($user)->postJson('/api/company-profile', [
            'public_profile' => $publicPdf,
            'full_profile' => $fullPdf,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseCount('company_profiles', 1);
        
        $profile = CompanyProfile::first();
        Storage::disk('public')->assertExists($profile->public_profile_path);
        Storage::disk('public')->assertExists($profile->full_profile_path);
    }

    public function test_public_can_download_public_profile()
    {
        Storage::fake('public');
        $publicPdf = UploadedFile::fake()->create('public.pdf', 100, 'application/pdf');
        $path = $publicPdf->store('company_profiles', 'public');
        
        CompanyProfile::create(['public_profile_path' => $path]);

        $response = $this->get('/api/company-profile/download/public');
        $response->assertStatus(200);
        $response->assertDownload('Public_Company_Profile.pdf');
    }

    public function test_authorized_user_can_generate_link()
    {
        $user = User::factory()->create();
        $user->givePermissionTo('cms.manage-company-profile');

        // Without full profile it should fail
        $this->actingAs($user)->postJson('/api/company-profile/generate-link')
             ->assertStatus(400);

        CompanyProfile::create(['full_profile_path' => 'dummy/path.pdf']);

        $response = $this->actingAs($user)->postJson('/api/company-profile/generate-link');
        $response->assertStatus(200);
        $response->assertJsonStructure(['link', 'token']);
        
        $this->assertDatabaseHas('profile_download_links', [
            'token' => $response->json('token'),
            'is_used' => false,
            'created_by' => $user->id
        ]);
    }

    public function test_anyone_can_download_full_profile_with_valid_token_only_once()
    {
        Storage::fake('public');
        $user = User::factory()->create();
        
        $fullPdf = UploadedFile::fake()->create('full.pdf', 500, 'application/pdf');
        $path = $fullPdf->store('company_profiles', 'public');
        
        CompanyProfile::create(['full_profile_path' => $path]);

        $link = ProfileDownloadLink::create([
            'token' => 'random-token-123',
            'is_used' => false,
            'created_by' => $user->id,
        ]);

        // First download succeeds
        $response1 = $this->get('/api/company-profile/download/random-token-123');
        $response1->assertStatus(200);
        $response1->assertDownload('Full_Company_Profile.pdf');

        // Link is now marked used
        $this->assertTrue($link->fresh()->is_used);

        // Second download fails
        $response2 = $this->get('/api/company-profile/download/random-token-123');
        $response2->assertStatus(403);
    }
}

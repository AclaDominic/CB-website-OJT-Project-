<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CompanyProfileController extends Controller
{
    public function index()
    {
        $profile = \App\Models\CompanyProfile::first();
        return response()->json($profile ?: null);
    }

    public function update(Request $request)
    {
        $request->validate([
            'public_profile' => 'nullable|file|mimes:pdf|max:204800', // 200MB max
            'full_profile' => 'nullable|file|mimes:pdf|max:204800',
        ]);

        $profile = \App\Models\CompanyProfile::first() ?? new \App\Models\CompanyProfile();

        if ($request->hasFile('public_profile')) {
            if ($profile->public_profile_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($profile->public_profile_path);
            }
            $profile->public_profile_path = $request->file('public_profile')->store('company_profiles', 'public');
        }

        if ($request->hasFile('full_profile')) {
            if ($profile->full_profile_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($profile->full_profile_path);
            }
            $profile->full_profile_path = $request->file('full_profile')->store('company_profiles', 'public');
        }

        $profile->save();

        return response()->json([
            'message' => 'Company profile updated successfully.',
            'profile' => $profile
        ]);
    }

    public function generateLink(Request $request)
    {
        // Must have a full profile to generate a link for it
        $profile = \App\Models\CompanyProfile::first();
        if (!$profile || !$profile->full_profile_path) {
            return response()->json(['message' => 'No full company profile uploaded yet.'], 400);
        }

        $token = \Illuminate\Support\Str::random(32);
        
        $link = \App\Models\ProfileDownloadLink::create([
            'token' => $token,
            'is_used' => false,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Download link generated successfully.',
            'link' => url("/api/company-profile/download/{$token}"),
            'token' => $token
        ]);
    }

    public function listLinks()
    {
        $links = \App\Models\ProfileDownloadLink::orderBy('created_at', 'desc')->get()->map(function ($link) {
            return [
                'id' => $link->id,
                'token' => $link->token,
                'link' => url("/api/company-profile/download/{$link->token}"),
                'is_used' => $link->is_used,
                'created_at' => $link->created_at->toDateTimeString(),
                'created_by' => $link->created_by,
            ];
        });

        return response()->json($links);
    }

    public function deleteLink($id)
    {
        $link = \App\Models\ProfileDownloadLink::findOrFail($id);
        $link->delete();

        return response()->json(['message' => 'Link deleted successfully.']);
    }
}

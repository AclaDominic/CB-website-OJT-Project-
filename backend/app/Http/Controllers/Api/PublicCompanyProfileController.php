<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PublicCompanyProfileController extends Controller
{
    public function downloadPublic()
    {
        $profile = \App\Models\CompanyProfile::first();
        if (!$profile || !$profile->public_profile_path) {
            return response()->json(['message' => 'Public profile not found.'], 404);
        }

        $fullPath = storage_path('app/public/' . $profile->public_profile_path);

        if (!file_exists($fullPath)) {
            return response()->json(['message' => 'File not found on server.'], 404);
        }

        return response()->download($fullPath, 'Cliberduche Company Profile.pdf', [
            'Content-Type' => 'application/pdf',
        ]);
    }

    public function downloadFull($token)
    {
        $link = \App\Models\ProfileDownloadLink::where('token', $token)->first();

        if (!$link) {
            return response()->json(['message' => 'Invalid download link.'], 404);
        }

        // Atomic update to avoid race condition
        $updated = \App\Models\ProfileDownloadLink::where('id', $link->id)
            ->where('is_used', false)
            ->update(['is_used' => true]);

        if (!$updated) {
            return response()->json(['message' => 'This download link has already been used.'], 403);
        }

        // Proceed to download
        $profile = \App\Models\CompanyProfile::first();
        if (!$profile || !$profile->full_profile_path) {
            \App\Models\ProfileDownloadLink::where('id', $link->id)->update(['is_used' => false]);
            return response()->json(['message' => 'Full profile not found.'], 404);
        }

        $fullPath = storage_path('app/public/' . $profile->full_profile_path);

        if (!file_exists($fullPath)) {
            \App\Models\ProfileDownloadLink::where('id', $link->id)->update(['is_used' => false]);
            return response()->json(['message' => 'File not found on server.'], 404);
        }

        return response()->download($fullPath, 'Cliberduche Full Company Profile.pdf', [
            'Content-Type' => 'application/pdf',
        ]);
    }
}

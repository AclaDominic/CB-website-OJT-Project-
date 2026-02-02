<?php

namespace App\Http\Controllers\Api\System;

use App\Http\Controllers\Controller;
use App\Models\DevelopmentSite;
use Illuminate\Http\Request;

class DevelopmentSiteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return DevelopmentSite::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'location' => 'required|string',
            'capacity' => 'required|string',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'image' => 'nullable|image|max:5120', // Accept 'image'
            'image_file' => 'nullable|image|max:5120', // Keep 'image_file' for backward compatibility
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('sites', 'public');
            $validated['image_url'] = $path;
        } elseif ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('sites', 'public');
            $validated['image_url'] = $path;
        }

        unset($validated['image']);
        unset($validated['image_file']);

        $site = DevelopmentSite::create($validated);
        return response()->json($site, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return DevelopmentSite::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $site = DevelopmentSite::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string',
            'location' => 'string',
            'capacity' => 'string',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'image' => 'nullable|image|max:5120',
            'image_file' => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            if ($site->image_url && !filter_var($site->image_url, FILTER_VALIDATE_URL)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($site->image_url);
            }
            $path = $request->file('image')->store('sites', 'public');
            $validated['image_url'] = $path;
        } elseif ($request->hasFile('image_file')) {
            if ($site->image_url && !filter_var($site->image_url, FILTER_VALIDATE_URL)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($site->image_url);
            }
            $path = $request->file('image_file')->store('sites', 'public');
            $validated['image_url'] = $path;
        }

        unset($validated['image']);
        unset($validated['image_file']);

        $site->update($validated);
        return response()->json($site);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        DevelopmentSite::destroy($id);
        return response()->json(['message' => 'Deleted successfully']);
    }
}

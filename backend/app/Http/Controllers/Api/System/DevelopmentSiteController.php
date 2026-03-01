<?php

namespace App\Http\Controllers\Api\System;

use App\Http\Controllers\Controller;
use App\Http\Requests\System\StoreDevelopmentSiteRequest;
use App\Http\Requests\System\UpdateDevelopmentSiteRequest;
use App\Models\DevelopmentSite;
use Illuminate\Support\Facades\Storage;

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
    public function store(StoreDevelopmentSiteRequest $request)
    {
        $validated = $request->validated();

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
    public function update(UpdateDevelopmentSiteRequest $request, string $id)
    {
        $site = DevelopmentSite::findOrFail($id);
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            if ($site->image_url && !filter_var($site->image_url, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($site->image_url);
            }
            $path = $request->file('image')->store('sites', 'public');
            $validated['image_url'] = $path;
        } elseif ($request->hasFile('image_file')) {
            if ($site->image_url && !filter_var($site->image_url, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($site->image_url);
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

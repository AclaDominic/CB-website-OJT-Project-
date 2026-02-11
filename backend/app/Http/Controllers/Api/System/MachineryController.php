<?php

namespace App\Http\Controllers\Api\System;

use App\Http\Controllers\Controller;
use App\Models\Machinery;
use Illuminate\Http\Request;

class MachineryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Admin View: Return everything
        if (auth('sanctum')->check()) {
            return Machinery::all();
        }

        // Public View: Hide decommissioned
        $query = Machinery::where('is_decommissioned', false);

        // Check display settings
        $settings = \App\Models\PageContent::where('page_name', 'resources')
            ->where('section_name', 'display_settings')
            ->first();

        $showPlates = false;
        if ($settings) {
            $config = json_decode($settings->content, true);
            $showPlates = $config['show_plate_numbers'] ?? false;
        }

        if ($showPlates) {
            return $query->get();
        } else {
            // Group by Name + Type and return unique items
            // Also hide plate_number to prevent leakage
            $all = $query->get();
            $unique = $all->unique(function ($item) {
                return $item->name . '|' . $item->type;
            });

            $unique->each(function ($item) {
                $item->makeHidden('plate_number');
            });

            return $unique->values();
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'type' => 'required|string',
            'plate_number' => 'nullable|string',
            'is_decommissioned' => 'boolean',
            'image_url' => 'nullable|string',
            'image_file' => 'nullable|image|max:5120', // Max 5MB
        ]);

        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('machinery', 'public');
            $validated['image_url'] = $path;
        }

        // Remove image_file from validated data as it's not in the database
        unset($validated['image_file']);

        $machinery = Machinery::create($validated);
        return response()->json($machinery, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Machinery::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $machinery = Machinery::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string',
            'type' => 'string',
            'plate_number' => 'nullable|string',
            'is_decommissioned' => 'boolean', // Handle "true"/"false" strings from FormData
            'image_url' => 'nullable|string',
            'image_file' => 'nullable|image|max:5120',
        ]);

        // Handle boolean conversion for FormData
        if (isset($validated['is_decommissioned'])) {
            $validated['is_decommissioned'] = filter_var($validated['is_decommissioned'], FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->hasFile('image_file')) {
            // Delete old image if it exists and is a local file
            if ($machinery->image_url && !filter_var($machinery->image_url, FILTER_VALIDATE_URL)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($machinery->image_url);
            }

            $path = $request->file('image_file')->store('machinery', 'public');
            $validated['image_url'] = $path;
        }

        unset($validated['image_file']);

        $machinery->update($validated);
        return response()->json($machinery);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Machinery::destroy($id);
        return response()->json(['message' => 'Deleted successfully']);
    }
}

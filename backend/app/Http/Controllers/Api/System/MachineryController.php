<?php

namespace App\Http\Controllers\Api\System;

use App\Http\Controllers\Controller;
use App\Models\Machinery;
use Illuminate\Http\Request;

class MachineryController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:inventory.create')->only(['store']);
        $this->middleware('permission:inventory.edit')->only(['update']);
        $this->middleware('permission:inventory.delete')->only(['destroy']);
    }

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
        $query = Machinery::where('status', '!=', 'Decommissioned');

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
            'status' => 'required|string',
            'image_url' => 'nullable|string',
            'image_file' => 'nullable|image|max:5120', // Max 5MB
            'project_id' => 'nullable|exists:projects,id',
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
            'status' => 'string',
            'image_url' => 'nullable|string',
            'image_file' => 'nullable|image|max:5120',
            'project_id' => 'nullable|exists:projects,id',
        ]);

        if ($request->hasFile('image_file')) {
            if ($machinery->image_url && !filter_var($machinery->image_url, FILTER_VALIDATE_URL)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($machinery->image_url);
            }
            $path = $request->file('image_file')->store('machinery', 'public');
            $validated['image_url'] = $path;
        }

        unset($validated['image_file']);

        // Business Logic: If Status is Active, Project ID is required.
        // If Project ID is provided, Status becomes Active (or In Use).
        // Let's allow manual status setting, but enforce constraints.

        if (isset($validated['status']) && $validated['status'] === 'Active') {
            if (empty($validated['project_id']) && empty($machinery->project_id)) {
                return response()->json(['message' => 'Active status requires a selected Project.'], 422);
            }
        }

        // If Project ID is being set
        if (array_key_exists('project_id', $validated)) {
            if ($validated['project_id']) {
                // Suggest Active/In Use if not explicitly set to something else?
                // Let's trust the frontend or default to Active.
                if (!isset($validated['status'])) {
                    $validated['status'] = 'Active';
                }
            } else {
                // Project removed
                if (!isset($validated['status']) || $validated['status'] === 'Active') {
                    $validated['status'] = 'Stand By';
                }
            }
        }

        $machinery->update($validated);
        return response()->json($machinery);
    }

    public function destroy(string $id)
    {
        Machinery::destroy($id);
        return response()->json(['message' => 'Deleted successfully']);
    }

    public function assignProject(Request $request, string $id)
    {
        $machinery = Machinery::findOrFail($id);

        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id'
        ]);

        $machinery->update([
            'project_id' => $validated['project_id'],
            'status' => 'Active'
        ]);

        return response()->json($machinery);
    }

    public function releaseProject(string $id)
    {
        $machinery = Machinery::findOrFail($id);

        $machinery->update([
            'project_id' => null,
            'status' => 'Stand By'
        ]);

        return response()->json($machinery);
    }
}

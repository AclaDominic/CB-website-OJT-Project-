<?php

namespace App\Http\Controllers;


use App\Models\InventoryCategory;
use Illuminate\Http\Request;

class InventoryCategoryController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:inventory.create')->only(['store']);
        $this->middleware('permission:inventory.edit')->only(['update']);
        $this->middleware('permission:inventory.delete')->only(['destroy']);
    }

    public function index()
    {
        // Return categories with their items and count
        return response()->json(InventoryCategory::with('items')->withCount('items')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:inventory_categories',
            'description' => 'nullable|string'
        ]);

        $category = InventoryCategory::create($validated);
        return response()->json($category, 201);
    }

    public function show($id)
    {
        return response()->json(InventoryCategory::with('items')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $category = InventoryCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:inventory_categories,name,' . $id,
            'description' => 'nullable|string'
        ]);

        $category->update($validated);
        return response()->json($category);
    }

    public function destroy($id)
    {
        $category = InventoryCategory::findOrFail($id);
        $category->delete();
        return response()->json(null, 204);
    }
}

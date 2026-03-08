<?php

namespace App\Http\Controllers;

use App\Http\Requests\Inventory\StoreInventoryCategoryRequest;
use App\Http\Requests\Inventory\UpdateInventoryCategoryRequest;
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
        if (!auth()->user()->can('inventory.view') && !auth()->user()->can('inventory.create')) {
            abort(403, 'Unauthorized access to inventory.');
        }

        // Return categories with their items and count
        return response()->json(InventoryCategory::with('items')->withCount('items')->get());
    }

    public function store(StoreInventoryCategoryRequest $request)
    {
        $validated = $request->validated();

        $category = InventoryCategory::create($validated);
        return response()->json($category, 201);
    }

    public function show($id)
    {
        if (!auth()->user()->can('inventory.view') && !auth()->user()->can('inventory.create')) {
            abort(403, 'Unauthorized access to inventory.');
        }

        return response()->json(InventoryCategory::with('items')->findOrFail($id));
    }

    public function update(UpdateInventoryCategoryRequest $request, $id)
    {
        $category = InventoryCategory::findOrFail($id);
        $validated = $request->validated();

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

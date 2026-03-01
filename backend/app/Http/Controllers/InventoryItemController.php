<?php

namespace App\Http\Controllers;

use App\Http\Requests\Inventory\StoreInventoryItemRequest;
use App\Http\Requests\Inventory\UpdateInventoryItemRequest;
use App\Http\Requests\Inventory\StockRequest;
use App\Models\InventoryItem;
use App\Models\InventoryCategory;
use App\Models\InventoryTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryItemController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:inventory.create')->only(['store', 'addStock', 'removeStock']);
        $this->middleware('permission:inventory.edit')->only(['update']);
        $this->middleware('permission:inventory.delete')->only(['destroy']);
    }

    public function index(Request $request)
    {
        $query = InventoryItem::with('category');

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        return response()->json($query->get());
    }

    public function store(StoreInventoryItemRequest $request)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $request) {
            $item = InventoryItem::create([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'sku' => $validated['sku'] ?? null,
                'description' => $validated['description'] ?? null,
                'threshold' => $validated['threshold'],
                'unit' => $validated['unit'] ?? null,
                'quantity' => $validated['initial_stock'] ?? 0
            ]);

            if (!empty($validated['initial_stock']) && $validated['initial_stock'] > 0) {
                InventoryTransaction::create([
                    'inventory_item_id' => $item->id,
                    'user_id' => $request->user()?->id,
                    'type' => 'initial',
                    'quantity' => $validated['initial_stock'],
                    'remarks' => 'Initial stock'
                ]);
            }

            return response()->json($item, 201);
        });
    }

    public function update(UpdateInventoryItemRequest $request, $id)
    {
        $item = InventoryItem::findOrFail($id);
        $validated = $request->validated();

        $item->update($validated);
        return response()->json($item);
    }

    public function destroy($id)
    {
        $item = InventoryItem::findOrFail($id);
        $item->delete();
        return response()->json(null, 204);
    }

    public function addStock(StockRequest $request, $id)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $request, $id) {
            // Lock the row to prevent race conditions
            $item = InventoryItem::lockForUpdate()->findOrFail($id);
            $quantity = $validated['quantity'];

            $item->increment('quantity', $quantity);

            InventoryTransaction::create([
                'inventory_item_id' => $item->id,
                'user_id' => $request->user()?->id,
                'type' => 'in',
                'quantity' => $quantity,
                'remarks' => $validated['remarks'] ?? null
            ]);

            return response()->json($item->refresh());
        });
    }

    public function removeStock(StockRequest $request, $id)
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($validated, $request, $id) {
            // Lock the row to prevent race conditions and ensure stock check is valid
            $item = InventoryItem::lockForUpdate()->findOrFail($id);
            $quantity = $validated['quantity'];

            if ($item->quantity < $quantity) {
                return response()->json(['error' => 'Insufficient stock'], 400);
            }

            $item->decrement('quantity', $quantity);

            InventoryTransaction::create([
                'inventory_item_id' => $item->id,
                'user_id' => $request->user()?->id,
                'type' => 'out',
                'quantity' => $quantity,
                'remarks' => $validated['remarks'] ?? null
            ]);

            return response()->json($item->refresh());
        });
    }
}

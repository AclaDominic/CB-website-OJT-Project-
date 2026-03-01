<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class StoreInventoryItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => 'required|exists:inventory_categories,id',
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|unique:inventory_items',
            'description' => 'nullable|string',
            'threshold' => 'required|integer|min:0',
            'unit' => 'nullable|string',
            'initial_stock' => 'nullable|integer|min:0',
        ];
    }
}

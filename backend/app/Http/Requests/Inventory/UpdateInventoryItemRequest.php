<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInventoryItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('inventory_item');

        return [
            'category_id' => 'exists:inventory_categories,id',
            'name' => 'string|max:255',
            'sku' => 'nullable|string|unique:inventory_items,sku,' . $id,
            'description' => 'nullable|string',
            'threshold' => 'integer|min:0',
            'unit' => 'nullable|string',
        ];
    }
}

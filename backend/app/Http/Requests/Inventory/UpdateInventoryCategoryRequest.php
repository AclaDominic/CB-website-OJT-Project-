<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInventoryCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('inventory_category');

        return [
            'name' => 'required|string|max:255|unique:inventory_categories,name,' . $id,
            'description' => 'nullable|string',
        ];
    }
}

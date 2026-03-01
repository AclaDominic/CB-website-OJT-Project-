<?php

namespace App\Http\Requests\System;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProcurementFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id' => 'sometimes|exists:projects,id',
            'remarks' => 'nullable|string',
            'items' => 'sometimes|array|min:1',
            'items.*.name' => 'required_with:items|string',
            'items.*.quantity' => 'required_with:items|numeric|min:0.01',
            'items.*.unit' => 'required_with:items|string',
            'items.*.notes' => 'nullable|string',
        ];
    }
}

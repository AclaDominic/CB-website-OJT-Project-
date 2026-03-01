<?php

namespace App\Http\Requests\System;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMachineryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'string',
            'type' => 'string',
            'plate_number' => 'nullable|string',
            'status' => 'string',
            'image_url' => 'nullable|string',
            'image_file' => 'nullable|image|max:5120',
            'project_id' => 'nullable|exists:projects,id',
        ];
    }
}

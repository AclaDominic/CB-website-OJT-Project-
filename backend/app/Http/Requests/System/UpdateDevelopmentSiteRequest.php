<?php

namespace App\Http\Requests\System;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDevelopmentSiteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'string',
            'location' => 'string',
            'capacity' => 'string',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'image' => 'nullable|image|max:5120',
            'image_file' => 'nullable|image|max:5120',
        ];
    }
}

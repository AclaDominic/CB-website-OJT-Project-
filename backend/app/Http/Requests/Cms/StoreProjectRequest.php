<?php

namespace App\Http\Requests\Cms;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required',
            'location' => 'required',
            'year' => 'required',
            'scope' => 'required',
            'status' => 'required|in:ongoing,completed',
            'is_public' => 'boolean',
            'image' => 'nullable|image',
            'image_url' => 'nullable|url',
        ];
    }
}

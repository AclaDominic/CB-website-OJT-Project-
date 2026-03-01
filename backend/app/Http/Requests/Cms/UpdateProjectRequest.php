<?php

namespace App\Http\Requests\Cms;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required',
            'location' => 'sometimes|required',
            'year' => 'sometimes|required',
            'scope' => 'sometimes|required',
            'status' => 'sometimes|required|in:ongoing,completed',
            'is_public' => 'boolean',
            'image' => 'nullable|image',
        ];
    }
}

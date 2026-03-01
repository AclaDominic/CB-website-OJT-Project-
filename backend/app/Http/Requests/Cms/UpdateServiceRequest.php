<?php

namespace App\Http\Requests\Cms;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required',
            'description' => 'sometimes|required',
            'type' => 'sometimes|required|in:primary,secondary',
            'image' => 'nullable|image',
        ];
    }
}

<?php

namespace App\Http\Requests\Cms;

use Illuminate\Foundation\Http\FormRequest;

class StorePageContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'page_name' => 'required|string',
            'section_name' => 'required|string',
            'content' => 'required',
            'show_profile' => 'sometimes|boolean',
        ];
    }
}

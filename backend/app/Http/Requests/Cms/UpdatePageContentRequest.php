<?php

namespace App\Http\Requests\Cms;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePageContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'page_name' => 'sometimes|string',
            'section_name' => 'sometimes|string',
            'content' => 'sometimes|required',
            'show_profile' => 'sometimes|boolean',
        ];
    }
}

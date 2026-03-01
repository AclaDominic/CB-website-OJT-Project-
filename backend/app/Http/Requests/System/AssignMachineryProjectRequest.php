<?php

namespace App\Http\Requests\System;

use Illuminate\Foundation\Http\FormRequest;

class AssignMachineryProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id' => 'required|exists:projects,id',
        ];
    }
}

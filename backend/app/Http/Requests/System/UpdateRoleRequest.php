<?php

namespace App\Http\Requests\System;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|unique:roles,name,' . $this->route('role'),
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name',
        ];
    }
}

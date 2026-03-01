<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrganizationMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:organization_members,id',
            'image' => 'nullable|image|max:2048',
            'order' => [
                'integer',
                'min:0',
                Rule::unique('organization_members')->where(function ($query) {
                    return $query->where('category', $this->category);
                }),
            ],
        ];
    }
}

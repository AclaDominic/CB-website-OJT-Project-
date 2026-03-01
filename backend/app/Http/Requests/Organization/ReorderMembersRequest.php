<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;

class ReorderMembersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'members' => 'required|array',
            'members.*.id' => 'required|exists:organization_members,id',
            'members.*.order' => 'required|integer',
        ];
    }
}

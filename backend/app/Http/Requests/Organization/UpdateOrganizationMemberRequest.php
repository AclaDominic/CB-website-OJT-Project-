<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrganizationMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $member = $this->route('organization_member');
        $memberId = is_object($member) ? $member->id : $member;

        return [
            'name' => 'sometimes|required|string|max:255',
            'role' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:255',
            'parent_id' => 'nullable|exists:organization_members,id',
            'image' => 'nullable|image|max:2048',
            'order' => [
                'integer',
                'min:0',
                Rule::unique('organization_members')->where(function ($query) {
                    $categoryToCheck = $this->has('category')
                        ? $this->category
                        : (is_object($this->route('organization_member'))
                            ? $this->route('organization_member')->category
                            : null);
                    return $query->where('category', $categoryToCheck);
                })->ignore($memberId),
            ],
        ];
    }
}

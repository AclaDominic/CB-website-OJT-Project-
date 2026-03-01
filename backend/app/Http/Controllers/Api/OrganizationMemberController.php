<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Organization\StoreOrganizationMemberRequest;
use App\Http\Requests\Organization\UpdateOrganizationMemberRequest;
use App\Http\Requests\Organization\ReorderMembersRequest;
use App\Models\OrganizationMember;
use Illuminate\Support\Facades\Storage;

class OrganizationMemberController extends Controller
{
    public function index()
    {
        return OrganizationMember::orderBy('order')->get();
    }

    public function store(StoreOrganizationMemberRequest $request)
    {
        $validated = $request->validated();

        $data = $validated;
        unset($data['image']); // Remove image from data array before creating (handled separately)

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('organization-members', 'public');
            $data['image_path'] = '/storage/' . $path;
        }

        $member = OrganizationMember::create($data);

        return response()->json($member, 201);
    }

    public function update(UpdateOrganizationMemberRequest $request, OrganizationMember $organizationMember)
    {
        $validated = $request->validated();

        $data = $validated;
        unset($data['image']);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($organizationMember->image_path) {
                // Remove /storage/ prefix to delete from disk
                $oldPath = str_replace('/storage/', '', $organizationMember->image_path);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('image')->store('organization-members', 'public');
            $data['image_path'] = '/storage/' . $path;
        }

        $organizationMember->update($data);

        return response()->json($organizationMember);
    }

    public function destroy(OrganizationMember $organizationMember)
    {
        if ($organizationMember->image_path) {
            $oldPath = str_replace('/storage/', '', $organizationMember->image_path);
            Storage::disk('public')->delete($oldPath);
        }

        $organizationMember->delete();

        return response()->json(null, 204);
    }

    public function reorder(ReorderMembersRequest $request)
    {
        $validated = $request->validated();

        foreach ($validated['members'] as $item) {
            OrganizationMember::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return response()->json(['message' => 'Order updated successfully']);
    }
}

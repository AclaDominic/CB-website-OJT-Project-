<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrganizationMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OrganizationMemberController extends Controller
{
    public function index()
    {
        return OrganizationMember::orderBy('order')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'image' => 'nullable|image|max:2048', // Allow image upload
            'order' => 'integer',
        ]);

        $data = $validated;
        unset($data['image']); // Remove image from data array before creating (handled separately)

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('organization-members', 'public');
            $data['image_path'] = '/storage/' . $path;
        }

        $member = OrganizationMember::create($data);

        return response()->json($member, 201);
    }

    public function update(Request $request, OrganizationMember $organizationMember)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'role' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:255',
            'image' => 'nullable|image|max:2048',
            'order' => 'integer',
        ]);

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

    public function reorder(Request $request)
    {
        $request->validate([
            'members' => 'required|array',
            'members.*.id' => 'required|exists:organization_members,id',
            'members.*.order' => 'required|integer',
        ]);

        foreach ($request->members as $item) {
            OrganizationMember::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return response()->json(['message' => 'Order updated successfully']);
    }
}

<?php

namespace App\Http\Controllers\Api\System;

use App\Http\Controllers\Controller;
use App\Models\ProcurementRequest;
use App\Models\ProcurementItem;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProcurementController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = ProcurementRequest::with(['items', 'project', 'user'])->latest();

        // Admin/Staff can view all, PM/SE view only their own (or project based? usually their own requests or project requests)
        // For now, let's allow PM/SE to view all requests for projects they are assigned to, or just their own.
        // Simplified: PM/SE see their own requests.
        // Actually, user requirement: "Who can edit Draft? The Project Manager or Site Engineer".
        // "Page Structure... Tab 1 - Active... Tab 2 - Completed"

        if ($user->hasRole(['Project Manager', 'Site Engineer'])) {
            // Ideally filters by project, but for simplicity/MVP, show own requests + maybe requests for their projects.
            // Let's stick to "User's requests" for now as the prompt implies "They... Make Request".
            // However, "Visible to Staff for processing".
            // Let's return all for now, frontend can filter or we can add filters.
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('tab')) {
            if ($request->tab === 'active') {
                $query->whereIn('status', [
                    ProcurementRequest::STATUS_DRAFT,
                    ProcurementRequest::STATUS_SUBMITTED,
                    ProcurementRequest::STATUS_PROCESSING
                ]);
            } elseif ($request->tab === 'completed') {
                $query->whereIn('status', [
                    ProcurementRequest::STATUS_COMPLETED,
                    ProcurementRequest::STATUS_ARCHIVED
                ]);
            }
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        // Enforce Role: PM or SE (Strict check as Admin shouldn't create)
        if (!Auth::user()->hasRole(['Project Manager', 'Site Engineer'])) {
            return response()->json(['message' => 'Unauthorized. Only Project Managers and Site Engineers can create requests.'], 403);
        }

        if (!Auth::user()->can('procurement.create')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'project_id' => [
                'required',
                Rule::exists('projects', 'id')->where('status', 'ongoing'), // Ensure project is ongoing
            ],
            'remarks' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.name' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit' => 'required|string',
            'items.*.notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $procurement = ProcurementRequest::create([
                'project_id' => $validated['project_id'],
                'user_id' => Auth::id(),
                'status' => ProcurementRequest::STATUS_DRAFT,
                'remarks' => $validated['remarks'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $procurement->items()->create($item);
            }

            DB::commit();
            return response()->json($procurement->load('items'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create request', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        // Check view permission
        if (!Auth::user()->can('procurement.view')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $procurement = ProcurementRequest::with(['items', 'project', 'user'])->findOrFail($id);
        return response()->json($procurement);
    }

    public function update(Request $request, $id)
    {
        $procurement = ProcurementRequest::findOrFail($id);

        // Enforce Owner/Role
        if ($procurement->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only DRAFT can be edited
        if ($procurement->status !== ProcurementRequest::STATUS_DRAFT) {
            return response()->json(['message' => 'Cannot edit a request that is not in draft status'], 400);
        }

        $validated = $request->validate([
            'project_id' => 'sometimes|exists:projects,id',
            'remarks' => 'nullable|string',
            'items' => 'sometimes|array|min:1',
            'items.*.name' => 'required_with:items|string',
            'items.*.quantity' => 'required_with:items|numeric|min:0.01',
            'items.*.unit' => 'required_with:items|string',
            'items.*.notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $procurement->update($request->only(['project_id', 'remarks']));

            if ($request->has('items')) {
                $procurement->items()->delete();
                foreach ($request->items as $item) {
                    $procurement->items()->create($item);
                }
            }

            DB::commit();
            return response()->json($procurement->load('items'));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Update failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $procurement = ProcurementRequest::findOrFail($id);

        if (!Auth::user()->can('procurement.delete')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($procurement->user_id !== Auth::id()) {
            // Option: Decide if PM/SE can delete OTHERS' drafts? 
            // Guideline: "Allow drafts to be deleted by PM and SE".
            // Implementation: Let's allow deletion if they have permission, regardless of owner, OR restrict to owner.
            // Safe bet: Restrict to owner for now, unless implicit requirement suggests "Managing" all drafts.
            // Given "PM and SE", and they are creators, usually they delete their own.
            // But if PM wants to clean up SE's draft?
            // Let's stick to OWNER ONLY for safety as requested "safer". 
            // "make an rbac for that so that its safer" -> likely means restrict to role + owner.
            return response()->json(['message' => 'Unauthorized. You can only delete your own requests.'], 403);
        }

        if ($procurement->status !== ProcurementRequest::STATUS_DRAFT) {
            return response()->json(['message' => 'Cannot delete a request that is not in draft status'], 400);
        }

        $procurement->delete();
        return response()->json(['message' => 'Request deleted']);
    }

    public function changeStatus(Request $request, $id)
    {
        $procurement = ProcurementRequest::findOrFail($id);
        $user = Auth::user();
        $newStatus = $request->status;

        // Validation Logic for Transitions
        switch ($newStatus) {
            case ProcurementRequest::STATUS_SUBMITTED:
                // From: Draft -> To: Submitted
                // Who: PM or SE (Must be owner or have generic submit permission? Usually owner)
                if ($procurement->status !== ProcurementRequest::STATUS_DRAFT) {
                    return response()->json(['message' => 'Invalid status transition'], 400);
                }

                // Strict Role Check
                if (!$user->hasRole(['Project Manager', 'Site Engineer'])) {
                    return response()->json(['message' => 'Unauthorized. Only Project Managers and Site Engineers can submit requests.'], 403);
                }

                if (!$user->can('procurement.submit')) {
                    return response()->json(['message' => 'Unauthorized to submit'], 403);
                }
                if ($procurement->user_id !== $user->id) { // Only owner can submit their draft?
                    // Verify if generic "submit" allows submitting others' drafts. Usually no.
                    return response()->json(['message' => 'Only the creator can submit this request'], 403);
                }
                break;

            case ProcurementRequest::STATUS_PROCESSING:
                // From: Submitted -> To: Processing
                // Who: Staff
                if ($procurement->status !== ProcurementRequest::STATUS_SUBMITTED) {
                    return response()->json(['message' => 'Invalid status transition'], 400);
                }
                if (!$user->can('procurement.process')) {
                    return response()->json(['message' => 'Unauthorized to process'], 403);
                }
                break;

            case ProcurementRequest::STATUS_COMPLETED:
                // From: Processing -> To: Completed
                // Who: Staff
                if ($procurement->status !== ProcurementRequest::STATUS_PROCESSING) {
                    return response()->json(['message' => 'Invalid status transition'], 400);
                }
                if (!$user->can('procurement.complete')) {
                    return response()->json(['message' => 'Unauthorized to complete'], 403);
                }
                break;

            case ProcurementRequest::STATUS_ARCHIVED:
                // From: Completed -> To: Archived
                // Who: Staff
                if ($procurement->status !== ProcurementRequest::STATUS_COMPLETED) {
                    return response()->json(['message' => 'Invalid status transition'], 400);
                }
                if (!$user->can('procurement.archive')) {
                    return response()->json(['message' => 'Unauthorized to archive'], 403);
                }
                break;

            default:
                return response()->json(['message' => 'Invalid status'], 400);
        }

        // Update Status
        $procurement->status = $newStatus;

        // Add Staff notes if provided during processing
        if ($request->has('supplier_notes')) {
            $procurement->supplier_notes = $request->supplier_notes;
        }
        if ($request->has('expected_arrival_date')) {
            $procurement->expected_arrival_date = $request->expected_arrival_date;
        }

        $procurement->save();

        return response()->json($procurement);
    }
}

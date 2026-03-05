<?php

namespace App\Http\Controllers\Api\System;

use App\Http\Controllers\Controller;
use App\Http\Requests\System\StoreProcurementFormRequest;
use App\Http\Requests\System\UpdateProcurementFormRequest;
use App\Http\Resources\ProcurementRequestResource;
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

        if ($user->hasRole(['Project Manager', 'Site Engineer'])) {
            // PM/SE can view all requests — frontend handles filtering
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
                    ProcurementRequest::STATUS_ARCHIVED,
                    ProcurementRequest::STATUS_REJECTED
                ]);
            }
        }

        return ProcurementRequestResource::collection($query->get());
    }

    public function store(StoreProcurementFormRequest $request)
    {
        // Enforce Role: PM or SE (Strict check as Admin shouldn't create)
        if (!Auth::user()->hasRole(['Project Manager', 'Site Engineer'])) {
            return response()->json(['message' => 'Unauthorized. Only Project Managers and Site Engineers can create requests.'], 403);
        }

        if (!Auth::user()->can('procurement.create')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validated();

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

            $procurement->load(['items', 'project', 'user']);
            return new ProcurementRequestResource($procurement);

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
        return new ProcurementRequestResource($procurement);
    }

    public function update(UpdateProcurementFormRequest $request, $id)
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

        $validated = $request->validated();

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
            $procurement->load(['items', 'project', 'user']);
            return new ProcurementRequestResource($procurement);
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
                if ($procurement->status !== ProcurementRequest::STATUS_DRAFT) {
                    return response()->json(['message' => 'Invalid status transition'], 400);
                }

                if (!$user->hasRole(['Project Manager', 'Site Engineer'])) {
                    return response()->json(['message' => 'Unauthorized. Only Project Managers and Site Engineers can submit requests.'], 403);
                }

                if (!$user->can('procurement.submit')) {
                    return response()->json(['message' => 'Unauthorized to submit'], 403);
                }
                if ($procurement->user_id !== $user->id) {
                    return response()->json(['message' => 'Only the creator can submit this request'], 403);
                }
                break;

            case ProcurementRequest::STATUS_PROCESSING:
                if ($procurement->status !== ProcurementRequest::STATUS_SUBMITTED) {
                    return response()->json(['message' => 'Invalid status transition'], 400);
                }
                if (!$user->can('procurement.process')) {
                    return response()->json(['message' => 'Unauthorized to process'], 403);
                }
                break;

            case ProcurementRequest::STATUS_COMPLETED:
                if ($procurement->status !== ProcurementRequest::STATUS_PROCESSING) {
                    return response()->json(['message' => 'Invalid status transition'], 400);
                }
                if (!$user->can('procurement.complete')) {
                    return response()->json(['message' => 'Unauthorized to complete'], 403);
                }
                break;

            case ProcurementRequest::STATUS_ARCHIVED:
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

        $procurement->load(['items', 'project', 'user']);
        return new ProcurementRequestResource($procurement);
    }

    public function generateReport(Request $request)
    {
        $user = Auth::user();
        if (!$user->can('procurement.report')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = ProcurementRequest::with(['items', 'project', 'user'])->latest();

        // Project filter
        $projectName = null;
        if ($request->has('project_id') && !empty($request->project_id)) {
            $query->where('project_id', $request->project_id);
            $project = Project::find($request->project_id);
            if ($project) {
                $projectName = $project->name;
            }
        }

        // Date range filter
        $filterLabel = 'All Time';
        if ($request->has('date_range') && !empty($request->date_range)) {
            switch ($request->date_range) {
                case 'last_30_days':
                    $query->where('created_at', '>=', now()->subDays(30));
                    $filterLabel = 'Last 30 Days';
                    break;
                case 'current_year':
                    $query->whereYear('created_at', now()->year);
                    $filterLabel = 'Current Year (' . now()->year . ')';
                    break;
                case 'last_year':
                    $lastYear = now()->subYear()->year;
                    $query->whereYear('created_at', $lastYear);
                    $filterLabel = 'Last Year (' . $lastYear . ')';
                    break;
            }
        }

        $requests = $query->get();

        if ($requests->isEmpty()) {
            return response()->json(['message' => 'No procurement requests found for the selected criteria.'], 404);
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.procurement-report', [
            'requests' => $requests,
            'filterLabel' => $filterLabel,
            'projectName' => $projectName
        ]);

        return $pdf->download('procurement-report-' . now()->format('Ymd') . '.pdf');
    }
}

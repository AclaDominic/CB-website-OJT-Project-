<?php

namespace App\Http\Controllers\Api\System;

use App\Http\Controllers\Controller;
use App\Http\Requests\System\StoreProcurementFormRequest;
use App\Http\Requests\System\UpdateProcurementFormRequest;
use App\Http\Resources\ProcurementRequestResource;
use App\Models\ProcurementRequest;
use App\Services\ProcurementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProcurementController extends Controller
{
    public function __construct(protected ProcurementService $service) {}

    public function index(Request $request)
    {
        $user = Auth::user();

        if (!$user->can('procurement.view') && !$user->can('procurement.create')) {
            return response()->json(['message' => 'Unauthorized access'], 403);
        }

        $query = ProcurementRequest::with(['items', 'project', 'user'])->latest();

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
        $this->authorize('create', ProcurementRequest::class);

        $procurement = $this->service->create($request->validated(), Auth::id());

        return (new ProcurementRequestResource($procurement))->response()->setStatusCode(201);
    }

    public function show($id)
    {
        $this->authorize('view', ProcurementRequest::class);

        $procurement = ProcurementRequest::with(['items', 'project', 'user'])->findOrFail($id);

        return new ProcurementRequestResource($procurement);
    }

    public function update(UpdateProcurementFormRequest $request, $id)
    {
        $procurement = ProcurementRequest::findOrFail($id);

        $this->authorize('update', $procurement);

        try {
            $updated = $this->service->update($procurement, $request->validated());
            return new ProcurementRequestResource($updated);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function destroy($id)
    {
        $procurement = ProcurementRequest::findOrFail($id);

        $this->authorize('delete', $procurement);

        try {
            $this->service->delete($procurement);
            return response()->json(['message' => 'Request deleted']);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function changeStatus(Request $request, $id)
    {
        $procurement = ProcurementRequest::findOrFail($id);
        $newStatus   = $request->status;

        // Validate that the requested status is a valid target at all.
        // This returns 400 before any Policy check, matching the original behaviour
        // where the switch default returned "Invalid status".
        $validTargetStatuses = ['submitted', 'processing', 'completed', 'archived'];
        if (!in_array($newStatus, $validTargetStatuses, true)) {
            return response()->json(['message' => 'Invalid status'], 400);
        }

        // Policy: does this user have the right role/permission for this transition?
        $this->authorize('transitionTo', [$procurement, $newStatus]);

        // Service: is this a sequentially valid transition given the current state?
        try {
            $updated = $this->service->transitionStatus($procurement, $newStatus, $request->only([
                'supplier_notes',
                'expected_arrival_date',
            ]));
            return new ProcurementRequestResource($updated);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function generateReport(Request $request)
    {
        $this->authorize('generateReport', ProcurementRequest::class);

        try {
            return $this->service->generateReport($request->only([
                'project_id',
                'date_range',
            ]));
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }
}

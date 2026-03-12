<?php

namespace App\Services;

use App\Models\ProcurementRequest;
use App\Models\Project;
use App\Models\User;
use App\Notifications\ProcurementRequestedNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class ProcurementService
{
    /**
     * Create a new procurement request with its items inside a DB transaction.
     */
    public function create(array $data, int $userId): ProcurementRequest
    {
        return DB::transaction(function () use ($data, $userId) {
            $procurement = ProcurementRequest::create([
                'project_id' => $data['project_id'],
                'user_id'    => $userId,
                'status'     => ProcurementRequest::STATUS_DRAFT,
                'remarks'    => $data['remarks'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $procurement->items()->create($item);
            }

            return $procurement->load(['items', 'project', 'user']);
        });
    }

    /**
     * Update a draft procurement request and replace its items.
     * Assumes the caller has already verified ownership via Policy.
     *
     * @throws \InvalidArgumentException if the request is not in draft status.
     */
    public function update(ProcurementRequest $procurement, array $data): ProcurementRequest
    {
        if ($procurement->status !== ProcurementRequest::STATUS_DRAFT) {
            throw new \InvalidArgumentException('Cannot edit a request that is not in draft status');
        }

        return DB::transaction(function () use ($procurement, $data) {
            $procurement->update([
                'project_id' => $data['project_id'] ?? $procurement->project_id,
                'remarks'    => $data['remarks'] ?? $procurement->remarks,
            ]);

            if (isset($data['items'])) {
                $procurement->items()->delete();
                foreach ($data['items'] as $item) {
                    $procurement->items()->create($item);
                }
            }

            return $procurement->load(['items', 'project', 'user']);
        });
    }

    /**
     * Delete a draft procurement request.
     * Assumes the caller has already verified ownership + permission via Policy.
     *
     * @throws \InvalidArgumentException if the request is not in draft status.
     */
    public function delete(ProcurementRequest $procurement): void
    {
        if ($procurement->status !== ProcurementRequest::STATUS_DRAFT) {
            throw new \InvalidArgumentException('Cannot delete a request that is not in draft status');
        }

        $procurement->delete();
    }

    /**
     * Transition a procurement request to a new status.
     * Assumes the caller (Policy) has already verified the user's permission.
     * This method enforces the sequential state machine rules.
     *
     * @throws \InvalidArgumentException if the transition is sequentially invalid.
     */
    public function transitionStatus(ProcurementRequest $procurement, string $newStatus, array $data = []): ProcurementRequest
    {
        $validTransitions = [
            'submitted'  => ProcurementRequest::STATUS_DRAFT,
            'processing' => ProcurementRequest::STATUS_SUBMITTED,
            'completed'  => ProcurementRequest::STATUS_PROCESSING,
            'archived'   => ProcurementRequest::STATUS_COMPLETED,
        ];

        if (!isset($validTransitions[$newStatus]) || $procurement->status !== $validTransitions[$newStatus]) {
            throw new \InvalidArgumentException('Invalid status transition');
        }

        $procurement->status = $newStatus;

        if (isset($data['supplier_notes'])) {
            $procurement->supplier_notes = $data['supplier_notes'];
        }
        if (isset($data['expected_arrival_date'])) {
            $procurement->expected_arrival_date = $data['expected_arrival_date'];
        }

        $procurement->save();

        // Notify processors when a request is submitted
        if ($newStatus === ProcurementRequest::STATUS_SUBMITTED) {
            $processors = User::permission('procurement.process')->get();
            Notification::send($processors, new ProcurementRequestedNotification($procurement));
        }

        return $procurement->load(['items', 'project', 'user']);
    }

    /**
     * Generate and stream a procurement report PDF.
     * Assumes the caller has already verified permission via Policy.
     *
     * @throws \InvalidArgumentException if no records match the given filters.
     */
    public function generateReport(array $filters): \Illuminate\Http\Response
    {
        $query = ProcurementRequest::with(['items', 'project', 'user'])->latest();

        $projectName = null;
        if (!empty($filters['project_id'])) {
            $query->where('project_id', $filters['project_id']);
            $project = Project::find($filters['project_id']);
            if ($project) {
                $projectName = $project->name;
            }
        }

        $filterLabel = 'All Time';
        if (!empty($filters['date_range'])) {
            switch ($filters['date_range']) {
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
            throw new \InvalidArgumentException('No procurement requests found for the selected criteria.');
        }

        $pdf = Pdf::loadView('pdf.procurement-report', [
            'requests'    => $requests,
            'filterLabel' => $filterLabel,
            'projectName' => $projectName,
        ]);

        return $pdf->download('procurement-report-' . now()->format('Ymd') . '.pdf');
    }
}

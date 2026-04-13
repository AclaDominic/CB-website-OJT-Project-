<?php

namespace App\Policies;

use App\Models\ProcurementRequest;
use App\Models\User;

class ProcurementPolicy
{
    /**
     * Can the user view procurement requests?
     * Matches the dual-permission check in the original controller index/show.
     */
    public function view(User $user): bool
    {
        return $user->can('procurement.view');
    }

    /**
     * Can the user create a procurement request?
     * Preserves the intentional dual-check: role AND permission.
     * Admin is deliberately excluded by the role check.
     */
    public function create(User $user): bool
    {
        return $user->hasRole(['Project Manager', 'Site Engineer'])
            && $user->can('procurement.create');
    }

    /**
     * Can the user update a procurement request?
     * Only the owner can edit (status check stays in Service).
     */
    public function update(User $user, ProcurementRequest $procurement): bool
    {
        return $procurement->user_id === $user->id;
    }

    /**
     * Can the user delete a procurement request?
     * Requires permission AND ownership (status check stays in Service).
     */
    public function delete(User $user, ProcurementRequest $procurement): bool
    {
        return $user->can('procurement.delete')
            && $procurement->user_id === $user->id;
    }

    /**
     * Can the user transition this procurement request to a given status?
     * Only answers "who is allowed" — sequence validation stays in Service.
     */
    public function transitionTo(User $user, ProcurementRequest $procurement, string $newStatus): bool
    {
        return match ($newStatus) {
            'submitted' => $user->hasRole(['Project Manager', 'Site Engineer'])
                && $user->can('procurement.submit')
                && $procurement->user_id === $user->id,
            'processing' => $user->can('procurement.process'),
            'completed'  => $user->can('procurement.complete'),
            'archived'   => $user->can('procurement.archive'),
            default      => false,
        };
    }

    /**
     * Can the user generate procurement reports?
     */
    public function generateReport(User $user): bool
    {
        return $user->can('procurement.report');
    }
}

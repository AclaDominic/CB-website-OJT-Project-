<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\ProcurementRequest;
use App\Models\Project;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isStaffOrAdmin = $user->hasRole(['Admin', 'Staff']);
        $canViewInventory = $user->can('inventory.view') || $user->hasRole('Admin');

        // 1. Low Stock Count
        // Only show if user has permission to view inventory
        $lowStockCount = $canViewInventory
            ? InventoryItem::whereColumn('quantity', '<=', 'threshold')->count()
            : null;

        // 2. Pending Procurement Requests
        // Admin/Staff: See ALL pending
        // PM/SE: See only THEIR OWN pending
        $pendingQuery = ProcurementRequest::whereIn('status', [
            ProcurementRequest::STATUS_SUBMITTED,
            ProcurementRequest::STATUS_PROCESSING
        ]);

        if (!$isStaffOrAdmin) {
            $pendingQuery->where('user_id', $user->id);
        }

        $pendingProcurementCount = $pendingQuery->count();

        // 3. Active Projects (Visible to all)
        $activeProjectsCount = Project::where('status', 'ongoing')->count();

        // 4. Recent Procurement Requests
        $recentQuery = ProcurementRequest::with(['project', 'user'])->latest()->take(5);

        if (!$isStaffOrAdmin) {
            $recentQuery->where('user_id', $user->id);
        }

        $recentProcurement = $recentQuery->get();

        return response()->json([
            'low_stock_count' => $lowStockCount,
            'pending_procurement_count' => $pendingProcurementCount,
            'active_projects_count' => $activeProjectsCount,
            'recent_procurement' => $recentProcurement,
            'permissions' => [
                'can_view_inventory' => $canViewInventory,
                'can_create_project' => $user->can('project.create') || $user->hasRole('Admin'),
                'can_create_user' => $user->can('user.create') || $user->hasRole('Admin'),
            ]
        ]);
    }
}

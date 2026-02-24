<?php

namespace App\Http\Controllers\Api\System;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\ProcurementRequest;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isStaffOrAdmin = $user->hasRole(['Admin', 'Staff']);
        $canViewInventory = $user->can('inventory.view') || $user->hasRole('Admin');

        // 1. Low Stock Count
        $lowStockCount = $canViewInventory
            ? Cache::remember('dashboard.low_stock_count', 60, function () {
                return InventoryItem::whereColumn('quantity', '<=', 'threshold')->count();
            })
            : 0;

        // Machinery Stats
        $machineryStats = Cache::remember('dashboard.machinery_stats', 60, function () {
            return [
                'total' => \App\Models\Machinery::where('status', '!=', 'Decommissioned')->count(),
                'available' => \App\Models\Machinery::where('status', 'Stand By')->count(),
                'in_use' => \App\Models\Machinery::whereIn('status', ['Active', 'Lease'])->count(),
                'maintenance' => \App\Models\Machinery::where('status', 'Maintenance')->count(),
            ];
        });

        // Project Status Stats
        $projectStats = Cache::remember('dashboard.project_stats', 60, function () {
            return [
                'ongoing' => Project::where('status', 'ongoing')->count(),
                'completed' => Project::where('status', 'completed')->count(),
            ];
        });

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

        // System Alerts Status
        $activeAlerts = \App\Models\SystemAlert::where('resolved', false)
            ->latest()
            ->get();

        $systemStatus = 'System Operational';
        if ($activeAlerts->contains('type', 'critical')) {
            $systemStatus = 'Critical Problem';
        } elseif ($activeAlerts->contains('type', 'minor')) {
            $systemStatus = 'Minor Problem';
        }

        return response()->json([
            'low_stock_count' => $lowStockCount,
            'pending_procurement_count' => $pendingProcurementCount,
            'active_projects_count' => $activeProjectsCount,
            'recent_procurement' => $recentProcurement,
            'machinery_stats' => $machineryStats,
            'project_stats' => $projectStats,
            'system_status' => $systemStatus,
            'system_alerts' => $activeAlerts,
            'permissions' => [
                'can_view_inventory' => $canViewInventory,
                'can_create_project' => $user->can('projects.create') || $user->hasRole('Admin'),
                'can_create_user' => $user->can('system.manage_users') || $user->hasRole('Admin'),
            ]
        ]);
    }
}

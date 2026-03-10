<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        $user = $request->user()->load(['department', 'roles']);
        $user->all_permissions = $user->getAllPermissions()->pluck('name');
        return $user;
    });

    Route::put('/user/password', [\App\Http\Controllers\Api\System\ProfileController::class, 'updatePassword']);

    Route::apiResource('services', \App\Http\Controllers\Api\Cms\ServiceController::class)->except(['index', 'show']);
    Route::apiResource('projects', \App\Http\Controllers\Api\Cms\ProjectController::class)->except(['index', 'show']);
    Route::apiResource('faqs', \App\Http\Controllers\Api\Cms\FaqController::class)->except(['index', 'show']);
    Route::apiResource('inquiries', \App\Http\Controllers\Api\Cms\InquiryController::class)->except(['store']);
    Route::put('/inquiries/{inquiry}/archive', [\App\Http\Controllers\Api\Cms\InquiryController::class, 'archive']);

    Route::apiResource('machineries', \App\Http\Controllers\Api\System\MachineryController::class)->except(['index', 'show']);
    Route::post('/machineries/{id}/assign-project', [\App\Http\Controllers\Api\System\MachineryController::class, 'assignProject']);
    Route::post('/machineries/{id}/release-project', [\App\Http\Controllers\Api\System\MachineryController::class, 'releaseProject']);
    Route::apiResource('development-sites', \App\Http\Controllers\Api\System\DevelopmentSiteController::class)->except(['index', 'show']);
    Route::apiResource('organization-members', \App\Http\Controllers\Api\OrganizationMemberController::class)->except(['index', 'show']);
    Route::post('/organization-members/reorder', [\App\Http\Controllers\Api\OrganizationMemberController::class, 'reorder']);

    Route::get('procurement/report', [\App\Http\Controllers\Api\System\ProcurementController::class, 'generateReport']);
    Route::apiResource('procurement', \App\Http\Controllers\Api\System\ProcurementController::class);
    Route::post('procurement/{id}/status', [\App\Http\Controllers\Api\System\ProcurementController::class, 'changeStatus']);

    // Page Contents (CMS)
    Route::post('/page-contents', [\App\Http\Controllers\Api\Cms\PageContentController::class, 'store']);

    // System Portal (RBAC)
    Route::prefix('system')->middleware(['role:Admin|Project Manager|Site Engineer|Staff'])->group(function () {
        Route::get('dashboard-stats', [\App\Http\Controllers\Api\System\DashboardController::class, 'index']);

        Route::middleware(['role:Admin'])->group(function () {
            Route::apiResource('roles', \App\Http\Controllers\Api\System\RoleController::class);
            Route::get('permissions', [\App\Http\Controllers\Api\System\PermissionController::class, 'index']);
            Route::apiResource('users', \App\Http\Controllers\Api\System\UserController::class)->only(['index', 'store', 'update']);
            Route::post('system-alerts/{id}/resolve', [\App\Http\Controllers\Api\System\SystemAlertController::class, 'resolve']);

            // Backup Management
            Route::get('backups', [\App\Http\Controllers\Api\System\BackupController::class, 'index'])->middleware('permission:view_backups');
            Route::post('backups', [\App\Http\Controllers\Api\System\BackupController::class, 'store'])->middleware('permission:create_backups');
            Route::get('backups/{file_name}', [\App\Http\Controllers\Api\System\BackupController::class, 'download'])
                ->where('file_name', '.*')->name('backups.download')->middleware('permission:download_backups');
            Route::delete('backups/{file_name}', [\App\Http\Controllers\Api\System\BackupController::class, 'destroy'])
                ->where('file_name', '.*')->middleware('permission:delete_backups');
        });
    });

    // Inventory Management
    Route::apiResource('inventory-categories', \App\Http\Controllers\InventoryCategoryController::class);
    Route::apiResource('inventory-items', \App\Http\Controllers\InventoryItemController::class);
    Route::post('/inventory-items/{item}/add-stock', [\App\Http\Controllers\InventoryItemController::class, 'addStock']);
    Route::post('/inventory-items/{item}/remove-stock', [\App\Http\Controllers\InventoryItemController::class, 'removeStock']);

    // Notifications
    Route::get('/notifications', function (Request $request) {
        return $request->user()->unreadNotifications;
    });
    Route::post('/notifications/{id}/read', function (Request $request, $id) {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();
        return response()->json(['message' => 'Marked as read']);
    });
    Route::post('/notifications/read-all', function (Request $request) {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['message' => 'All marked as read']);
    });
});

Route::get('/services', [\App\Http\Controllers\Api\Cms\ServiceController::class, 'index']);
Route::get('/services/{service}', [\App\Http\Controllers\Api\Cms\ServiceController::class, 'show']);

Route::get('/projects', [\App\Http\Controllers\Api\Cms\ProjectController::class, 'index']);
Route::get('/projects/{project}', [\App\Http\Controllers\Api\Cms\ProjectController::class, 'show']);

Route::get('/faqs', [\App\Http\Controllers\Api\Cms\FaqController::class, 'index']);

Route::get('/machineries', [\App\Http\Controllers\Api\System\MachineryController::class, 'index']);
Route::get('/machineries/{machinery}', [\App\Http\Controllers\Api\System\MachineryController::class, 'show']);

Route::get('/development-sites', [\App\Http\Controllers\Api\System\DevelopmentSiteController::class, 'index']);
Route::get('/development-sites/{site}', [\App\Http\Controllers\Api\System\DevelopmentSiteController::class, 'show']);

Route::get('/page-contents', [\App\Http\Controllers\Api\Cms\PageContentController::class, 'index']);
Route::get('/organization-members', [\App\Http\Controllers\Api\OrganizationMemberController::class, 'index']);

Route::post('/inquiries', [\App\Http\Controllers\Api\Cms\InquiryController::class, 'store'])->middleware('throttle:5,1');

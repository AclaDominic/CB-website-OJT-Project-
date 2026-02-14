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

    Route::apiResource('services', \App\Http\Controllers\Api\Cms\ServiceController::class)->except(['index', 'show']);
    Route::apiResource('projects', \App\Http\Controllers\Api\Cms\ProjectController::class)->except(['index', 'show']);
    Route::apiResource('inquiries', \App\Http\Controllers\Api\Cms\InquiryController::class);
    Route::put('/inquiries/{inquiry}/archive', [\App\Http\Controllers\Api\Cms\InquiryController::class, 'archive']);

    Route::apiResource('machineries', \App\Http\Controllers\Api\System\MachineryController::class)->except(['index', 'show']);
    Route::apiResource('development-sites', \App\Http\Controllers\Api\System\DevelopmentSiteController::class)->except(['index', 'show']);
    Route::apiResource('organization-members', \App\Http\Controllers\Api\OrganizationMemberController::class)->except(['index', 'show']);
    Route::post('/organization-members/reorder', [\App\Http\Controllers\Api\OrganizationMemberController::class, 'reorder']);

    // Admin System (RBAC)
    Route::prefix('admin')->middleware(['role:Admin'])->group(function () {
        Route::apiResource('roles', \App\Http\Controllers\Api\Admin\RoleController::class);
        Route::get('permissions', [\App\Http\Controllers\Api\Admin\PermissionController::class, 'index']);

        Route::apiResource('users', \App\Http\Controllers\Api\Admin\UserController::class)->only(['index', 'store', 'update']);
    });
});

Route::get('/services', [\App\Http\Controllers\Api\Cms\ServiceController::class, 'index']);
Route::get('/services/{service}', [\App\Http\Controllers\Api\Cms\ServiceController::class, 'show']);

Route::get('/projects', [\App\Http\Controllers\Api\Cms\ProjectController::class, 'index']);
Route::get('/projects/{project}', [\App\Http\Controllers\Api\Cms\ProjectController::class, 'show']);

Route::get('/machineries', [\App\Http\Controllers\Api\System\MachineryController::class, 'index']);
Route::get('/machineries/{machinery}', [\App\Http\Controllers\Api\System\MachineryController::class, 'show']);

Route::get('/development-sites', [\App\Http\Controllers\Api\System\DevelopmentSiteController::class, 'index']);
Route::get('/development-sites/{site}', [\App\Http\Controllers\Api\System\DevelopmentSiteController::class, 'show']);

Route::get('/page-contents', [\App\Http\Controllers\Api\Cms\PageContentController::class, 'index']);
Route::get('/organization-members', [\App\Http\Controllers\Api\OrganizationMemberController::class, 'index']);

Route::post('/inquiries', [\App\Http\Controllers\Api\Cms\InquiryController::class, 'store']);

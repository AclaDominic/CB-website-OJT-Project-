<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): Response|\Illuminate\Http\JsonResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Retrieve and format the validated user directly instead of returning 204
        $user = $request->user()->load(['department', 'roles']);
        $user->all_permissions = $user->getAllPermissions()->pluck('name');

        return response()->json($user);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): Response
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->noContent();
    }
}

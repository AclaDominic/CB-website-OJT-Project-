<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return User::with('roles')->get();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => 'required|string|exists:roles,name',
        ]);

        $user->syncRoles([$validated['role']]);

        // Also update the legacy 'role' column for backward compatibility?
        // $user->update(['role' => $validated['role']]); 
        // Or keep them separate. Spatie uses 'model_has_roles'.
        // For now, syncing Spatie roles is enough.

        return response()->json($user->load('roles'));
    }
}

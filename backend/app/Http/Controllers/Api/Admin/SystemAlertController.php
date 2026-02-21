<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SystemAlertController extends Controller
{
    public function resolve(Request $request, $id)
    {
        $alert = \App\Models\SystemAlert::findOrFail($id);

        $alert->update([
            'resolved' => true,
            'resolved_by' => $request->user()->id,
            'resolved_at' => now(),
        ]);

        return response()->json([
            'message' => 'System alert marked as resolved',
            'alert' => $alert
        ]);
    }
}

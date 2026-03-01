<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreInquiryRequest;
use App\Models\Inquiry;
use Illuminate\Http\Request;

class InquiryController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:cms.edit')->only(['archive', 'destroy']);
    }

    public function index(Request $request)
    {
        $query = Inquiry::query();

        // 1. Filter by Status (Active vs Archived)
        if ($request->has('archived') && $request->boolean('archived')) {
            $query->whereNotNull('archived_at');
        } else {
            $query->whereNull('archived_at');
        }

        // 2. Filter by Sent Date (created_at)
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // 3. Filter by Archived Date (archived_at)
        if ($request->has('archived_from')) {
            $query->whereDate('archived_at', '>=', $request->archived_from);
        }
        if ($request->has('archived_to')) {
            $query->whereDate('archived_at', '<=', $request->archived_to);
        }

        return $query->latest()->get();
    }

    public function store(StoreInquiryRequest $request)
    {
        $validated = $request->validated();

        try {
            return Inquiry::create($validated);
        } catch (\Exception $e) {
            \App\Models\SystemAlert::create([
                'type' => 'minor',
                'message' => 'Failed to process contact inquiry',
                'context' => [
                    'error' => $e->getMessage(),
                    'data' => $validated
                ]
            ]);
            return response()->json(['message' => 'An error occurred while processing your request. Please try again later.'], 500);
        }
    }

    public function show(Inquiry $inquiry)
    {
        return $inquiry;
    }

    /**
     * Archive the specified inquiry.
     */
    public function archive(Inquiry $inquiry)
    {
        $inquiry->update(['archived_at' => now()]);
        return response()->json(['message' => 'Inquiry archived successfully']);
    }

    /**
     * Terminate the specified inquiry (Permanent Delete).
     */
    public function destroy(Inquiry $inquiry)
    {
        $inquiry->delete();
        return response()->noContent();
    }
}

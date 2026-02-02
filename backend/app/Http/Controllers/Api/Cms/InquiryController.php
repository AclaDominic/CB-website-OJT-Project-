<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use Illuminate\Http\Request;

class InquiryController extends Controller
{
    public function index()
    {
        return Inquiry::latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'email' => 'required|email',
            'message' => 'required',
            'subject' => 'nullable|string',
        ]);

        return Inquiry::create($validated);
    }

    public function show(Inquiry $inquiry)
    {
        return $inquiry;
    }

    public function destroy(Inquiry $inquiry)
    {
        $inquiry->delete();
        return response()->noContent();
    }
}

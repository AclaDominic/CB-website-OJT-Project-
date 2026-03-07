<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreServiceRequest;
use App\Http\Requests\Cms\UpdateServiceRequest;
use App\Models\Service;
use Illuminate\Support\Facades\Storage;

class ServiceController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:cms.edit')->only(['store', 'update', 'destroy']);
    }

    public function index()
    {
        return Service::all();
    }

    public function show(Service $service)
    {
        return $service;
    }

    public function store(StoreServiceRequest $request)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('services', 'public');
        } elseif ($request->has('image_url')) {
            $validated['image'] = $request->input('image_url');
        }

        return Service::create($validated);
    }

    public function update(UpdateServiceRequest $request, Service $service)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            if ($service->image && !str_starts_with($service->image, 'http')) {
                Storage::disk('public')->delete($service->image);
            }
            $validated['image'] = $request->file('image')->store('services', 'public');
        } elseif ($request->has('image_url')) {
            if ($service->image && !str_starts_with($service->image, 'http') && $service->image !== $request->input('image_url')) {
                Storage::disk('public')->delete($service->image);
            }
            $validated['image'] = $request->input('image_url');
        }

        $service->update($validated);
        return $service;
    }

    public function destroy(Service $service)
    {
        if ($service->image && !str_starts_with($service->image, 'http')) {
            Storage::disk('public')->delete($service->image);
        }
        $service->delete();
        return response()->noContent();
    }
}

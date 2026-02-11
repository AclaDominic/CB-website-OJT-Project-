<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjectController extends Controller
{
    public function index()
    {
        return Project::all();
    }

    public function show(Project $project)
    {
        return $project;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'location' => 'required',
            'year' => 'required',
            'scope' => 'required',
            'status' => 'required|in:ongoing,completed',
            'image' => 'nullable|image',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('projects', 'public');
        }

        return Project::create($validated);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required',
            'location' => 'sometimes|required',
            'year' => 'sometimes|required',
            'scope' => 'sometimes|required',
            'status' => 'sometimes|required|in:ongoing,completed',
            'image' => 'nullable|image',
        ]);

        if ($request->hasFile('image')) {
            if ($project->image) {
                Storage::disk('public')->delete($project->image);
            }
            $validated['image'] = $request->file('image')->store('projects', 'public');
        }

        $project->update($validated);
        return $project;
    }

    public function destroy(Project $project)
    {
        if ($project->image) {
            Storage::disk('public')->delete($project->image);
        }
        $project->delete();
        return response()->noContent();
    }
}

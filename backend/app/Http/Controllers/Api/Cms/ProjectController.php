<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreProjectRequest;
use App\Http\Requests\Cms\UpdateProjectRequest;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjectController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:projects.create')->only(['store']);
        $this->middleware('permission:projects.edit')->only(['update']);
        $this->middleware('permission:projects.delete')->only(['destroy']);
    }

    public function index(Request $request)
    {
        $query = Project::query();

        if ($request->has('public')) {
            $query->where('is_public', true);
        }

        return $query->with('beforeAfters')->get();
    }

    public function show(Project $project)
    {
        return $project;
    }

    public function store(StoreProjectRequest $request)
    {
        $validated = $request->validated();

        // Default is_public to false if not provided, or handle as per requirement
        $validated['is_public'] = $request->boolean('is_public');

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('projects', 'public');
        }

        $project = Project::create($validated);

        if ($request->has('before_afters')) {
            foreach ($request->file('before_afters', []) as $index => $files) {
                $beforePath = null;
                $afterPath = null;

                if (isset($files['before'])) {
                    $beforePath = $files['before']->store('projects/gallery', 'public');
                }
                if (isset($files['after'])) {
                    $afterPath = $files['after']->store('projects/gallery', 'public');
                }

                if ($beforePath || $afterPath) {
                    $project->beforeAfters()->create([
                        'before_image' => $beforePath,
                        'after_image' => $afterPath,
                    ]);
                }
            }
        }

        return $project->load('beforeAfters');
    }

    public function update(UpdateProjectRequest $request, Project $project)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            if ($project->image) {
                Storage::disk('public')->delete($project->image);
            }
            $validated['image'] = $request->file('image')->store('projects', 'public');
        }

        if (isset($validated['status']) && $validated['status'] === 'completed') {
            // Release all machinery
            $project->machineries()->update(['project_id' => null, 'status' => 'Stand By']);
        }

        if ($request->has('kept_gallery_ids')) {
            $keptIds = $request->input('kept_gallery_ids');
            if (!is_array($keptIds)) {
                $keptIds = explode(',', $keptIds);
            }

            $toDelete = $project->beforeAfters()->whereNotIn('id', $keptIds)->get();
            foreach ($toDelete as $item) {
                if ($item->before_image)
                    Storage::disk('public')->delete($item->before_image);
                if ($item->after_image)
                    Storage::disk('public')->delete($item->after_image);
                $item->delete();
            }
        }

        if ($request->file('new_gallery')) {
            foreach ($request->file('new_gallery') as $files) {
                $beforePath = null;
                $afterPath = null;

                if (isset($files['before'])) {
                    $beforePath = $files['before']->store('projects/gallery', 'public');
                }
                if (isset($files['after'])) {
                    $afterPath = $files['after']->store('projects/gallery', 'public');
                }

                if ($beforePath || $afterPath) {
                    $project->beforeAfters()->create([
                        'before_image' => $beforePath,
                        'after_image' => $afterPath,
                    ]);
                }
            }
        }

        $project->update($validated);
        return $project->load('beforeAfters');
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

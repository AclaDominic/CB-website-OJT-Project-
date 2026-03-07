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
        } elseif ($request->has('image_url')) {
            $validated['image'] = $request->input('image_url');
        }

        $project = Project::create($validated);

        $newGalleryInputs = $request->input('new_gallery', []);
        $newGalleryFiles = $request->file('new_gallery', []);

        $indices = array_unique(array_merge(array_keys($newGalleryInputs), array_keys($newGalleryFiles)));

        foreach ($indices as $index) {
            $beforePath = null;
            $afterPath = null;

            if (isset($newGalleryFiles[$index]['before'])) {
                $beforePath = $newGalleryFiles[$index]['before']->store('projects/gallery', 'public');
            } elseif (isset($newGalleryInputs[$index]['before_url'])) {
                $beforePath = $newGalleryInputs[$index]['before_url'];
            }

            if (isset($newGalleryFiles[$index]['after'])) {
                $afterPath = $newGalleryFiles[$index]['after']->store('projects/gallery', 'public');
            } elseif (isset($newGalleryInputs[$index]['after_url'])) {
                $afterPath = $newGalleryInputs[$index]['after_url'];
            }

            if ($beforePath || $afterPath) {
                $project->beforeAfters()->create([
                    'before_image' => $beforePath,
                    'after_image' => $afterPath,
                ]);
            }
        }

        return $project->load('beforeAfters');
    }

    public function update(UpdateProjectRequest $request, Project $project)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            if ($project->image && !str_starts_with($project->image, 'http')) {
                Storage::disk('public')->delete($project->image);
            }
            $validated['image'] = $request->file('image')->store('projects', 'public');
        } elseif ($request->has('image_url')) {
            if ($project->image && !str_starts_with($project->image, 'http') && $project->image !== $request->input('image_url')) {
                Storage::disk('public')->delete($project->image);
            }
            $validated['image'] = $request->input('image_url');
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
                if ($item->before_image && !str_starts_with($item->before_image, 'http'))
                    Storage::disk('public')->delete($item->before_image);
                if ($item->after_image && !str_starts_with($item->after_image, 'http'))
                    Storage::disk('public')->delete($item->after_image);
                $item->delete();
            }
        }

        $updatedGalleryInputs = $request->input('updated_gallery', []);
        $updatedGalleryFiles = $request->file('updated_gallery', []);
        $updatedIndices = array_unique(array_merge(array_keys($updatedGalleryInputs), array_keys($updatedGalleryFiles)));

        foreach ($updatedIndices as $index) {
            $id = $updatedGalleryInputs[$index]['id'] ?? null;
            if (!$id)
                continue;

            $galleryItem = $project->beforeAfters()->find($id);
            if (!$galleryItem)
                continue;

            $beforePath = $galleryItem->before_image;
            $afterPath = $galleryItem->after_image;

            if (isset($updatedGalleryFiles[$index]['before'])) {
                if ($beforePath && !str_starts_with($beforePath, 'http')) {
                    Storage::disk('public')->delete($beforePath);
                }
                $beforePath = $updatedGalleryFiles[$index]['before']->store('projects/gallery', 'public');
            } elseif (isset($updatedGalleryInputs[$index]['before_url'])) {
                if ($beforePath && !str_starts_with($beforePath, 'http') && $beforePath !== $updatedGalleryInputs[$index]['before_url']) {
                    Storage::disk('public')->delete($beforePath);
                }
                $beforePath = $updatedGalleryInputs[$index]['before_url'];
            }

            if (isset($updatedGalleryFiles[$index]['after'])) {
                if ($afterPath && !str_starts_with($afterPath, 'http')) {
                    Storage::disk('public')->delete($afterPath);
                }
                $afterPath = $updatedGalleryFiles[$index]['after']->store('projects/gallery', 'public');
            } elseif (isset($updatedGalleryInputs[$index]['after_url'])) {
                if ($afterPath && !str_starts_with($afterPath, 'http') && $afterPath !== $updatedGalleryInputs[$index]['after_url']) {
                    Storage::disk('public')->delete($afterPath);
                }
                $afterPath = $updatedGalleryInputs[$index]['after_url'];
            }

            $galleryItem->update([
                'before_image' => $beforePath,
                'after_image' => $afterPath,
            ]);
        }

        $newGalleryInputs = $request->input('new_gallery', []);
        $newGalleryFiles = $request->file('new_gallery', []);
        $newIndices = array_unique(array_merge(array_keys($newGalleryInputs), array_keys($newGalleryFiles)));

        foreach ($newIndices as $index) {
            $beforePath = null;
            $afterPath = null;

            if (isset($newGalleryFiles[$index]['before'])) {
                $beforePath = $newGalleryFiles[$index]['before']->store('projects/gallery', 'public');
            } elseif (isset($newGalleryInputs[$index]['before_url'])) {
                $beforePath = $newGalleryInputs[$index]['before_url'];
            }

            if (isset($newGalleryFiles[$index]['after'])) {
                $afterPath = $newGalleryFiles[$index]['after']->store('projects/gallery', 'public');
            } elseif (isset($newGalleryInputs[$index]['after_url'])) {
                $afterPath = $newGalleryInputs[$index]['after_url'];
            }

            if ($beforePath || $afterPath) {
                $project->beforeAfters()->create([
                    'before_image' => $beforePath,
                    'after_image' => $afterPath,
                ]);
            }
        }

        $project->update($validated);
        return $project->load('beforeAfters');
    }

    public function destroy(Project $project)
    {
        if ($project->image && !str_starts_with($project->image, 'http')) {
            Storage::disk('public')->delete($project->image);
        }
        $project->delete();
        return response()->noContent();
    }
}

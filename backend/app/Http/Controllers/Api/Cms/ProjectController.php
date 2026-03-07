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

    /**
     * Resolve a gallery image value from request data.
     * Checks for file upload first, then falls back to URL string.
     */
    private function resolveGalleryImage(array $data, string $field, ?string $existingPath = null): ?string
    {
        // File upload takes priority
        if (isset($data[$field]) && $data[$field] instanceof \Illuminate\Http\UploadedFile) {
            if ($existingPath && !str_starts_with($existingPath, 'http')) {
                Storage::disk('public')->delete($existingPath);
            }
            return $data[$field]->store('projects/gallery', 'public');
        }

        // URL string
        if (isset($data[$field . '_url']) && !empty($data[$field . '_url'])) {
            if ($existingPath && !str_starts_with($existingPath, 'http')) {
                Storage::disk('public')->delete($existingPath);
            }
            return $data[$field . '_url'];
        }

        return $existingPath;
    }

    public function store(StoreProjectRequest $request)
    {
        $validated = $request->validated();

        // Default is_public to false if not provided, or handle as per requirement
        $validated['is_public'] = $request->boolean('is_public');

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('projects', 'public');
        } elseif ($request->filled('image_url')) {
            $validated['image'] = $request->input('image_url');
        }

        $project = Project::create($validated);

        // Handle new gallery items (supports both file uploads and URLs)
        $newGallery = $request->input('new_gallery', []);
        $newGalleryFiles = $request->file('new_gallery', []);

        // Merge file and input data
        foreach ($newGalleryFiles as $index => $files) {
            if (!isset($newGallery[$index]))
                $newGallery[$index] = [];
            $newGallery[$index] = array_merge($newGallery[$index], $files);
        }

        foreach ($newGallery as $data) {
            $beforePath = $this->resolveGalleryImage($data, 'before');
            $afterPath = $this->resolveGalleryImage($data, 'after');

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
        } elseif ($request->filled('image_url')) {
            if ($project->image && !str_starts_with($project->image, 'http')) {
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

        // Handle updates to existing gallery items
        $updatedGallery = $request->input('updated_gallery', []);
        $updatedGalleryFiles = $request->file('updated_gallery', []);

        foreach ($updatedGalleryFiles as $id => $files) {
            if (!isset($updatedGallery[$id]))
                $updatedGallery[$id] = [];
            $updatedGallery[$id] = array_merge($updatedGallery[$id], $files);
        }

        foreach ($updatedGallery as $id => $data) {
            $existing = $project->beforeAfters()->find($id);
            if (!$existing)
                continue;

            $beforePath = $this->resolveGalleryImage($data, 'before', $existing->before_image);
            $afterPath = $this->resolveGalleryImage($data, 'after', $existing->after_image);

            $existing->update([
                'before_image' => $beforePath,
                'after_image' => $afterPath,
            ]);
        }

        // Handle new gallery items (supports both file uploads and URLs)
        $newGallery = $request->input('new_gallery', []);
        $newGalleryFiles = $request->file('new_gallery', []);

        foreach ($newGalleryFiles as $index => $files) {
            if (!isset($newGallery[$index]))
                $newGallery[$index] = [];
            $newGallery[$index] = array_merge($newGallery[$index], $files);
        }

        foreach ($newGallery as $data) {
            $beforePath = $this->resolveGalleryImage($data, 'before');
            $afterPath = $this->resolveGalleryImage($data, 'after');

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
        if ($project->image) {
            Storage::disk('public')->delete($project->image);
        }
        $project->delete();
        return response()->noContent();
    }
}

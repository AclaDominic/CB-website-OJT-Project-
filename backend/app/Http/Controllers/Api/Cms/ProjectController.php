<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
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

        // If not authenticated or not admin/staff, only show public projects
        // Using a simple check here, assuming public API consumers won't have a token
        // Or if they do, we check permissions. 
        // For simplicity in this specific request context which implies a "public site",
        // we'll filter by is_public=true if a specific query param is present OR 
        // if we decide based on auth.
        // Let's assume the public site will call /api/projects?public=true or similar,
        // OR we can default to showing all for admins and only public for others.

        if ($request->has('public')) {
            $query->where('is_public', true);
        }

        return $query->with('beforeAfters')->get();
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
            'is_public' => 'boolean',
            'image' => 'nullable|image',
        ]);

        // Default is_public to false if not provided, or handle as per requirement
        $validated['is_public'] = $request->boolean('is_public');

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('projects', 'public');
        }

        $project = Project::create($validated);

        if ($request->has('before_afters')) {
            $gallery = $request->before_afters; // Expecting array of {before: text/file, after: text/file}
            // Since this is create, all are new.
            // But handling file array in Laravel from FormData is tricky if not indexed properly.
            // We'll assume the frontend sends:
            // before_afters[0][before] = file
            // before_afters[0][after] = file

            // However, typical FormData for files:
            // before_afters[0][before]

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

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required',
            'location' => 'sometimes|required',
            'year' => 'sometimes|required',
            'scope' => 'sometimes|required',
            'status' => 'sometimes|required|in:ongoing,completed',
            'is_public' => 'boolean',
            'image' => 'nullable|image',
        ]);

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

        // Handle Gallery
        // Frontend should send:
        // existing_gallery[id][before] = url (optional if not changing)
        // existing_gallery[id][after] = url
        // new_gallery[index][before] = file
        // new_gallery[index][after] = file

        // Or cleaner:
        // A single array 'gallery' where each item has:
        // id (nullable, if exists), before (file/string), after (file/string), _destroy (boolean)

        // For simplicity with FormData, let's stick to separate handling or a verified structure.
        // Let's go with:
        // gallery_actions: array of JSON describing what to do? No, files can't be in JSON.

        // Strategy:
        // 1. 'gallery_uploads': Array of files for new rows.
        // 2. 'gallery_updates': Array of files/ids for existing rows? 

        // EASIEST WAY for "Sync":
        // 1. 'kept_gallery_ids': [1, 3] -> Delete any ID not in this list.
        // 2. 'new_gallery': Array of {before: file, after: file}

        if ($request->has('kept_gallery_ids')) {
            $keptIds = $request->input('kept_gallery_ids');
            // If it's a single value, ensure it's array
            if (!is_array($keptIds)) {
                $keptIds = explode(',', $keptIds); // In case FormData sent strictly string
            }

            // Delete ones not in keptIds
            $toDelete = $project->beforeAfters()->whereNotIn('id', $keptIds)->get();
            foreach ($toDelete as $item) {
                if ($item->before_image)
                    Storage::disk('public')->delete($item->before_image);
                if ($item->after_image)
                    Storage::disk('public')->delete($item->after_image);
                $item->delete();
            }
        } else {
            // If key not present, do we assume delete all? Or just ignore?
            // Usually consistent frontend sends empty array if all deleted.
            // But if simply "not sent" by accident, dangerous.
            // Let's rely on explicit 'delete_gallery_ids' if possible, or just strict 'kept'.
            // Let's assume if it is NOT present, we do nothing to existing.
            // But if it IS present as empty array, we delete all.
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

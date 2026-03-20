<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class ProjectService
{
    /**
     * Create a new project along with its gallery images.
     */
    public function create(array $validatedData, array $allData, array $files = []): Project
    {
        return DB::transaction(function () use ($validatedData, $allData, $files) {
            // Default is_public to false if not provided
            $validatedData['is_public'] = filter_var($validatedData['is_public'] ?? false, FILTER_VALIDATE_BOOLEAN);

            // Handle main image
            if (isset($files['image']) && $files['image'] instanceof UploadedFile) {
                $validatedData['image'] = $files['image']->store('projects', 'public');
            } elseif (isset($allData['image_url'])) {
                $validatedData['image'] = $allData['image_url'];
            }

            $project = Project::create($validatedData);

            // Handle gallery images
            $newGalleryInputs = $allData['new_gallery'] ?? [];
            $newGalleryFiles = $files['new_gallery'] ?? [];
            $this->processNewGallery($project, $newGalleryInputs, $newGalleryFiles);

            return $project->load('beforeAfters');
        });
    }

    /**
     * Update an existing project and its gallery images.
     */
    public function update(Project $project, array $validatedData, array $allData, array $files = []): Project
    {
        return DB::transaction(function () use ($project, $validatedData, $allData, $files) {
            // Handle main image update
            if (isset($files['image']) && $files['image'] instanceof UploadedFile) {
                if ($project->image && !str_starts_with($project->image, 'http')) {
                    Storage::disk('public')->delete($project->image);
                }
                $validatedData['image'] = $files['image']->store('projects', 'public');
            } elseif (isset($allData['image_url'])) {
                if ($project->image && !str_starts_with($project->image, 'http') && $project->image !== $allData['image_url']) {
                    Storage::disk('public')->delete($project->image);
                }
                $validatedData['image'] = $allData['image_url'];
            }

            // Release all machinery if status is completed
            if (isset($validatedData['status']) && $validatedData['status'] === 'completed') {
                $project->machineries()->update(['project_id' => null, 'status' => 'Stand By']);
            }

            // Handle gallery cleanup
            if (isset($allData['kept_gallery_ids'])) {
                $keptIds = $allData['kept_gallery_ids'];
                if (!is_array($keptIds)) {
                    $keptIds = explode(',', $keptIds);
                }

                $toDelete = $project->beforeAfters()->whereNotIn('id', $keptIds)->get();
                foreach ($toDelete as $item) {
                    if ($item->before_image && !str_starts_with($item->before_image, 'http')) {
                        Storage::disk('public')->delete($item->before_image);
                    }
                    if ($item->after_image && !str_starts_with($item->after_image, 'http')) {
                        Storage::disk('public')->delete($item->after_image);
                    }
                    $item->delete();
                }
            }

            // Handle updated gallery
            $updatedGalleryInputs = $allData['updated_gallery'] ?? [];
            $updatedGalleryFiles = $files['updated_gallery'] ?? [];
            $this->processUpdatedGallery($project, $updatedGalleryInputs, $updatedGalleryFiles);

            // Handle new gallery
            $newGalleryInputs = $allData['new_gallery'] ?? [];
            $newGalleryFiles = $files['new_gallery'] ?? [];
            $this->processNewGallery($project, $newGalleryInputs, $newGalleryFiles);

            $project->update($validatedData);

            return $project->load('beforeAfters');
        });
    }

    /**
     * Delete a project and its associated files.
     */
    public function delete(Project $project): void
    {
        DB::transaction(function () use ($project) {
            if ($project->image && !str_starts_with($project->image, 'http')) {
                Storage::disk('public')->delete($project->image);
            }
            // `beforeAfters` and `machineries` could potentially be handled via Eloquent events or cascaded deletions
            // But we can clean up beforeAfter image files here before deleting DB records if necessary.
            foreach ($project->beforeAfters as $item) {
                if ($item->before_image && !str_starts_with($item->before_image, 'http')) {
                    Storage::disk('public')->delete($item->before_image);
                }
                if ($item->after_image && !str_starts_with($item->after_image, 'http')) {
                    Storage::disk('public')->delete($item->after_image);
                }
                $item->delete();
            }

            $project->delete();
        });
    }

    /**
     * Process new gallery creation for a project.
     */
    protected function processNewGallery(Project $project, array $newGalleryInputs, array $newGalleryFiles): void
    {
        $indices = array_unique(array_merge(array_keys($newGalleryInputs), array_keys($newGalleryFiles)));

        foreach ($indices as $index) {
            $beforePath = null;
            $afterPath = null;

            if (isset($newGalleryFiles[$index]['before']) && $newGalleryFiles[$index]['before'] instanceof UploadedFile) {
                $beforePath = $newGalleryFiles[$index]['before']->store('projects/gallery', 'public');
            } elseif (isset($newGalleryInputs[$index]['before_url'])) {
                $beforePath = $newGalleryInputs[$index]['before_url'];
            }

            if (isset($newGalleryFiles[$index]['after']) && $newGalleryFiles[$index]['after'] instanceof UploadedFile) {
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
    }

    /**
     * Process updates to an existing gallery for a project.
     */
    protected function processUpdatedGallery(Project $project, array $updatedGalleryInputs, array $updatedGalleryFiles): void
    {
        $updatedIndices = array_unique(array_merge(array_keys($updatedGalleryInputs), array_keys($updatedGalleryFiles)));

        foreach ($updatedIndices as $index) {
            $id = $updatedGalleryInputs[$index]['id'] ?? null;
            if (!$id) {
                continue;
            }

            $galleryItem = $project->beforeAfters()->find($id);
            if (!$galleryItem) {
                continue;
            }

            $beforePath = $galleryItem->before_image;
            $afterPath = $galleryItem->after_image;

            if (isset($updatedGalleryFiles[$index]['before']) && $updatedGalleryFiles[$index]['before'] instanceof UploadedFile) {
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

            if (isset($updatedGalleryFiles[$index]['after']) && $updatedGalleryFiles[$index]['after'] instanceof UploadedFile) {
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
    }
}

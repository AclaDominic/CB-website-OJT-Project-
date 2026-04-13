<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreProjectRequest;
use App\Http\Requests\Cms\UpdateProjectRequest;
use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function __construct(protected ProjectService $service) {}

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
        return $project->load('beforeAfters');
    }

    public function store(StoreProjectRequest $request)
    {
        $this->authorize('create', Project::class);

        $project = $this->service->create(
            $request->validated(),
            $request->all(),
            $request->allFiles()
        );

        return $project;
    }

    public function update(UpdateProjectRequest $request, Project $project)
    {
        $this->authorize('update', $project);

        $updatedProject = $this->service->update(
            $project,
            $request->validated(),
            $request->all(),
            $request->allFiles()
        );

        return $updatedProject;
    }

    public function destroy(Project $project)
    {
        $this->authorize('delete', $project);

        $this->service->delete($project);

        return response()->noContent();
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcurementRequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => 'PR-' . str_pad($this->id, 5, '0', STR_PAD_LEFT),
            'status' => $this->status,
            'remarks' => $this->remarks,
            'supplier_notes' => $this->supplier_notes,
            'expected_arrival_date' => $this->expected_arrival_date,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'project' => [
                'id' => $this->project_id,
                'name' => $this->project ? $this->project->name : null,
            ],
            'requested_by' => [
                'id' => $this->user_id,
                'name' => $this->user ? $this->user->name : null,
            ],
            'user' => [
                'id' => $this->user_id,
                'name' => $this->user ? $this->user->name : null,
            ],
            'items' => ProcurementItemResource::collection($this->whenLoaded('items')),
        ];
    }
}

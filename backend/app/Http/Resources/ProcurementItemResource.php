<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcurementItemResource extends JsonResource
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
            'quantity' => $this->quantity,
            'remarks' => $this->remarks,
            'item_details' => [
                'id' => $this->item_id,
                'name' => $this->item ? $this->item->name : null,
                'sku' => $this->item ? $this->item->sku : null,
                'unit' => $this->item ? $this->item->unit : null,
            ],
        ];
    }
}

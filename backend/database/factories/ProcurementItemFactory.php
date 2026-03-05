<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProcurementItem>
 */
class ProcurementItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'procurement_request_id' => \App\Models\ProcurementRequest::factory(),
            'item_id' => \App\Models\InventoryItem::factory(),
            'quantity' => $this->faker->numberBetween(1, 100),
            'remarks' => $this->faker->sentence(),
        ];
    }
}

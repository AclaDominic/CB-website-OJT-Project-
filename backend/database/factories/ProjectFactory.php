<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->bs,
            'location' => $this->faker->city,
            'year' => $this->faker->year,
            'status' => 'ongoing',
            'scope' => $this->faker->sentence,
            'image' => null,
        ];
    }
}

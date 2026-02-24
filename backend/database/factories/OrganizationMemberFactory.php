<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class OrganizationMemberFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->name,
            'role' => $this->faker->jobTitle,
            'category' => $this->faker->randomElement(['leadership', 'management', 'staff']),
            'order' => $this->faker->unique()->numberBetween(1, 1000),
            'parent_id' => null,
            'image_path' => null,
        ];
    }
}

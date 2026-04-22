<?php

namespace Database\Factories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

class DepartmentFactory extends Factory
{
    protected $model = Department::class;

    public function definition(): array
    {
        return [
            'department_code' => $this->faker->unique()->numerify('##'),
            'department_name' => $this->faker->state(), 
            'region_name' => $this->faker->state(), 
        ];
    }
}
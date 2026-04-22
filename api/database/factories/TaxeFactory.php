<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Taxe;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaxeFactory extends Factory
{
    protected $model = Taxe::class;

    public function definition(): array
    {
        return [
            'commune_code' => $this->faker->postcode(),
            'commune_name' => $this->faker->city(),
            'department_id' => Department::factory(),
            'tfpnb_amount' => $this->faker->randomFloat(2, 100, 5000),
            'tfpnb_percentage' => $this->faker->randomFloat(2, 1, 5),
            'tfpb_amount' => $this->faker->randomFloat(2, 100, 5000),
            'tfpb_percentage' => $this->faker->randomFloat(2, 1, 5),
            'th_amount' => $this->faker->randomFloat(2, 100, 5000),
            'th_percentage' => $this->faker->randomFloat(2, 1, 5),
            'cfe_amount' => $this->faker->randomFloat(2, 100, 5000),
            'cfe_percentage' => $this->faker->randomFloat(2, 1, 5),
            'year' => $this->faker->numberBetween(2019, 2022),
        ];
    }
}
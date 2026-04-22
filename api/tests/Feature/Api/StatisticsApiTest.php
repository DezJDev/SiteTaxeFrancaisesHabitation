<?php

namespace Tests\Feature\Api;

use App\Models\Department;
use App\Models\Taxe;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StatisticsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_global_stats_endpoint_returns_data_grouped_by_department(): void
    {
        $dept = Department::create(['department_code' => '27', 'department_name' => 'Eure', 'region_name' => 'Normandie']);

        Taxe::factory()->create([
            'department_id' => $dept->id,
            'tfpb_amount' => 500.50,
            'year' => 2020
        ]);

        $response = $this->get('/api/stats/global?group_by=department&year=2020', ['Accept' => 'application/ld+json']);

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'groupBy' => 'department',
                     'year' => 2020
                 ]);
    }
}
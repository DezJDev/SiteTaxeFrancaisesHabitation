<?php

namespace Tests\Feature\Api;

use App\Models\Department;
use App\Models\Taxe;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EndpointsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $dept = Department::factory()->create([
            'department_code' => '76',
            'department_name' => 'Seine-Maritime',
            'region_name' => 'Normandie'
        ]);

        Taxe::factory()->create([
            'department_id' => $dept->id,
            'commune_code' => '76001',
            'commune_name' => 'Le Havre',
            'year' => 2022,
            'tfpnb_amount' => 1000,
            'tfpb_amount' => 2000,
            'th_amount' => 3000,
            'cfe_amount' => 4000,
            'tfpnb_percentage' => 10.5,
            'tfpb_percentage' => 10.5,
            'th_percentage' => 10.5,
            'cfe_percentage' => 10.5,
        ]);
    }

    private function apiHeaders(): array
    {
        return ['Accept' => 'application/ld+json'];
    }

    public function test_api_taxes_collection(): void
    {
        $response = $this->get('/api/taxes', $this->apiHeaders());

        $response->assertStatus(200)
            ->assertJsonStructure([
                'member', 
                'totalItems',
            ]);
    }

    public function test_api_departments_collection(): void
    {
        $response = $this->get('/api/departments', $this->apiHeaders());

        $response->assertStatus(200)
            ->assertJsonStructure([
                'member',
                'totalItems'
            ]);
    }

    public function test_api_regions_collection(): void
    {
        $response = $this->get('/api/regions', $this->apiHeaders());

        $response->assertStatus(200)
            ->assertJsonStructure([
                'member'
            ]);
    }

    public function test_stats_global_endpoint(): void
    {
        $response = $this->get('/api/stats/global?group_by=department&year=2022', $this->apiHeaders());

        $response->assertStatus(200)
            ->assertJsonStructure([
                'groupBy',
                'year',
                'data'
            ]);
    }

    public function test_regions_distribution_endpoint(): void
    {
        $response = $this->get('/api/regions/distribution?tax_type=tfpnb&year=2022', $this->apiHeaders());

        $response->assertStatus(200)
            ->assertJsonStructure([
                'taxType',
                'year',
                'data' => [
                    '*' => ['region', 'total_amount']
                ]
            ]);
    }

    public function test_tax_timeseries_endpoint(): void
    {
        $response = $this->get('/api/taxes/timeseries?tax_type=tfpb', $this->apiHeaders());

        $response->assertStatus(200)
            ->assertJsonStructure([
                'taxType',
                'regions',
                'data' => [
                    'Normandie' => [
                        '*' => ['year', 'avg_rate']
                    ]
                ]
            ]);
    }

    public function test_commune_correlation_endpoint(): void
    {
        $response = $this->get('/api/communes/correlation?department_code=76&tax_type=th&year=2022', $this->apiHeaders());

        $response->assertStatus(200)
            ->assertJsonStructure([
                'departmentCode',
                'taxType',
                'year',
                'data' => [
                    '*' => ['commune_name', 'rate', 'amount']
                ]
            ]);
    }

    public function test_tax_field_stat_sum_endpoint(): void
    {
        $response = $this->get('/api/somme/tfpnb?department_code=76', $this->apiHeaders());

        $response->assertStatus(200)
            ->assertJsonStructure([
                'field',
                'sum',
                'filters'
            ]);
    }

    public function test_tax_field_stat_average_endpoint(): void
    {
        $response = $this->get('/api/average/cfe?year=2022', $this->apiHeaders());

        $response->assertStatus(200)
            ->assertJsonStructure([
                'field',
                'average',
                'filters'
            ]);
    }
}
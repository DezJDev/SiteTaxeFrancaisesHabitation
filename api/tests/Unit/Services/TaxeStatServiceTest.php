<?php

namespace Tests\Unit\Services;

use App\Models\Department;
use App\Models\Taxe;
use App\Services\TaxeStatService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaxeStatServiceTest extends TestCase
{
    use RefreshDatabase;

    private TaxeStatService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new TaxeStatService();
    }

    public function test_calculate_sum_returns_correct_value(): void
    {
        $dept = Department::create(['department_code' => '76', 'department_name' => 'Seine-Maritime', 'region_name' => 'Normandie']);

        Taxe::factory()->create([
            'department_id' => $dept->id,
            'tfpnb_amount' => 1000,
            'year' => 2022
        ]);

        Taxe::factory()->create([
            'department_id' => $dept->id,
            'tfpnb_amount' => 2000,
            'year' => 2022
        ]);

        $sum = $this->service->calculateSum(Taxe::FIELD_TFPNB, null, 2022);
        
        $this->assertEquals(3000, $sum);
    }

    public function test_validate_field_throws_exception_for_invalid_field(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->service->calculateSum('invalid_field');
    }
}
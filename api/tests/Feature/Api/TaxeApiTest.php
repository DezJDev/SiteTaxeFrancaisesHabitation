<?php

namespace Tests\Feature\Api;

use App\Models\Department;
use App\Models\Taxe;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaxeApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_taxes_collection_returns_paginated_data(): void
    {
        $dept = Department::factory()->create(['department_code' => '75', 'department_name' => 'Paris', 'region_name' => 'Île-de-France']);
        
        Taxe::factory()->count(5)->create([
            'department_id' => $dept->id,
            'year' => 2021
        ]);

        $response = $this->get('/api/taxes.jsonld?year=2021');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'member' => [
                         '*' => ['communeCode', 'communeName', 'tfpnbAmount', 'year']
                     ]
                 ]);
    }
}
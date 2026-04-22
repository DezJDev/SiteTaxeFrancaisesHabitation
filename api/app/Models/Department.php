<?php

namespace App\Models;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\QueryParameter;
use ApiPlatform\OpenApi\Model\Operation;
use ApiPlatform\OpenApi\Model\Response;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use ApiPlatform\Laravel\Eloquent\Filter\EqualsFilter;
use App\Filters\DepartmentSearchFilter;

#[ApiResource(
    description: 'French departments reference data (100 departments)',
    operations: [
        new GetCollection(
            openapi: new Operation(
                summary: 'List all French departments',
                description: 'Returns all 100 French departments with their name and region.',
                responses: [
                    '200' => new Response(description: 'Collection of departments'),
                ],
            ),
        ),
        new Get(
            uriTemplate: '/departments/{id}',
            uriVariables: ['id' => new Link(fromClass: Department::class, identifiers: ['id'])],
            openapi: new Operation(
                summary: 'Get a single department by its ID',
                description: 'Returns a department with its code, name and region.',
                responses: [
                    '200' => new Response(description: 'Department details'),
                    '404' => new Response(description: 'Department not found'),
                ],
            ),
        ),
    ]
)]
#[QueryParameter(key: 'department_code', description: 'Filter by department code (e.g. 76, 75, 13)', filter: EqualsFilter::class)]
#[QueryParameter(key: 'department_name', description: 'Filter by department name', filter: EqualsFilter::class)]
#[QueryParameter(key: 'region', description: 'Filter by region name (e.g. Normandie)', filter: EqualsFilter::class, property: 'region_name')]
#[QueryParameter(key: 'search', description: 'Search by department code or name (partial, case-insensitive)', filter: DepartmentSearchFilter::class)]
class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_code',
        'department_name',
        'region_name'
    ];

    protected $hidden = ['taxes'];

    protected $table = 'departments';
    public $timestamps = false;

    /**
     * Get the taxes for the department.
     */
    public function taxes()
    {
        return $this->hasMany(Taxe::class, 'department_id');
    }
}

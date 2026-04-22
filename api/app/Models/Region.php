<?php

namespace App\Models;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\OpenApi\Model\Operation;
use ApiPlatform\OpenApi\Model\Response;
use Illuminate\Database\Eloquent\Model;

#[ApiResource(
    description: 'Distinct French regions (from VIEW)',
    operations: [
        new GetCollection(
            openapi: new Operation(
                summary: 'List all French regions',
                description: 'Returns all distinct region names from the regions VIEW.',
                responses: [
                    '200' => new Response(description: 'Collection of regions'),
                ],
            ),
        ),
    ]
)]
class Region extends Model
{
    protected $table = 'regions';
    public $timestamps = false;
    public $incrementing = false;
}

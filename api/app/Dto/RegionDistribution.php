<?php

namespace App\Dto;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\QueryParameter;
use ApiPlatform\OpenApi\Model\Operation;
use ApiPlatform\OpenApi\Model\Response;
use App\State\RegionDistributionProvider;

#[ApiResource(
    shortName: 'RegionDistribution',
    description: 'Collected tax volume breakdown by region',
    paginationEnabled: false,
    operations: [
        new Get(
            uriTemplate: '/regions/distribution',
            name: 'region_distribution',
            openapi: new Operation(
                summary: 'Get regional breakdown of collected tax volumes for pie chart',
                description: 'Returns total collected amount per region for a given tax type and optional year.',
                responses: [
                    '200' => new Response(description: 'Array of regions with their total collected tax amount'),
                    '400' => new Response(description: 'Invalid or missing parameters (tax_type is required)'),
                ],
            ),
            provider: RegionDistributionProvider::class,
        ),
    ],
)]
#[QueryParameter(key: 'tax_type', description: 'Tax type to analyze', schema: ['type' => 'string', 'enum' => ['tfpnb', 'tfpb', 'th', 'cfe']], required: true)]
#[QueryParameter(key: 'year', description: 'Year of tax data (2019-2022)', schema: ['type' => 'integer'])]
class RegionDistribution
{
    public function __construct(
        public readonly string $tax_type = '',
        public readonly ?int $year = null,
        public readonly array $data = [],
    ) {}
}

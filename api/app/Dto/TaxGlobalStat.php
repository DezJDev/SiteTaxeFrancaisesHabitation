<?php

namespace App\Dto;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\QueryParameter;
use ApiPlatform\OpenApi\Model\Operation;
use ApiPlatform\OpenApi\Model\Response;
use App\State\TaxGlobalStatProvider;

#[ApiResource(
    shortName: 'TaxGlobalStat',
    description: 'Aggregated tax statistics grouped by department or region',
    paginationEnabled: false,
    operations: [
        new Get(
            uriTemplate: '/stats/global',
            name: 'tax_stats_global',
            openapi: new Operation(
                summary: 'Get aggregated tax statistics grouped by department or region',
                description: 'Returns sums and averages for all tax types, grouped by department or region.',
                responses: [
                    '200' => new Response(description: 'Array of groups with sums and averages for each tax type'),
                    '400' => new Response(description: 'Invalid group_by value (must be department or region)'),
                ],
            ),
            provider: TaxGlobalStatProvider::class,
        ),
    ],
)]
#[QueryParameter(key: 'group_by', description: 'Grouping level for aggregation', schema: ['type' => 'string', 'enum' => ['department', 'region']])]
#[QueryParameter(key: 'year', description: 'Year of tax data (2019-2022)', schema: ['type' => 'integer'])]
class TaxGlobalStat
{
    public function __construct(
        public readonly string $group_by = 'department',
        public readonly string|int|null $year = null,
        public readonly array $data = [],
    ) {}
}

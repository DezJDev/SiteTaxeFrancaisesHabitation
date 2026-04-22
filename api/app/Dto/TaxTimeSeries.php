<?php

namespace App\Dto;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\QueryParameter;
use ApiPlatform\OpenApi\Model\Operation;
use ApiPlatform\OpenApi\Model\Response;
use App\State\TaxTimeSeriesProvider;

#[ApiResource(
    shortName: 'TaxTimeSeries',
    description: 'Average tax rate evolution by year, grouped by region',
    paginationEnabled: false,
    operations: [
        new Get(
            uriTemplate: '/taxes/timeseries',
            name: 'tax_timeseries',
            openapi: new Operation(
                summary: 'Get average tax rate evolution by year for one, several, or all regions',
                description: 'Returns average tax rate per year and per region for a given tax type, with optional year range. If no region is specified, all regions are returned. Multiple regions can be comma-separated (e.g. region=Normandie,Bretagne).',
                responses: [
                    '200' => new Response(description: 'Object with regions array and data grouped by region'),
                    '400' => new Response(description: 'Invalid parameters (tax_type is required)'),
                ],
            ),
            provider: TaxTimeSeriesProvider::class,
        ),
    ],
)]
#[QueryParameter(key: 'region', description: 'French region name(s), comma-separated (e.g. Normandie,Île-de-France). Omit for all regions.', schema: ['type' => 'string'])]
#[QueryParameter(key: 'tax_type', description: 'Tax type to analyze', schema: ['type' => 'string', 'enum' => ['tfpnb', 'tfpb', 'th', 'cfe']], required: true)]
#[QueryParameter(key: 'start_year', description: 'Start year for the range (default: earliest available)', schema: ['type' => 'integer'])]
#[QueryParameter(key: 'end_year', description: 'End year for the range (default: latest available)', schema: ['type' => 'integer'])]
class TaxTimeSeries
{
    public function __construct(
        public readonly array $regions = [],
        public readonly string $tax_type = '',
        public readonly ?int $start_year = null,
        public readonly ?int $end_year = null,
        public readonly array $data = [],
    ) {}
}

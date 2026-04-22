<?php

namespace App\Dto;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\QueryParameter;
use ApiPlatform\OpenApi\Model\Operation;
use ApiPlatform\OpenApi\Model\Response;
use App\State\CommuneCorrelationProvider;

#[ApiResource(
    shortName: 'CommuneCorrelation',
    description: 'Tax rate vs collected amount correlation per commune in a department',
    paginationEnabled: false,
    operations: [
        new Get(
            uriTemplate: '/communes/correlation',
            name: 'commune_correlation',
            openapi: new Operation(
                summary: 'Get commune-level tax rate vs collected volume for scatter plot',
                description: 'Returns rate and collected amount for each commune in a given department, year and tax type.',
                responses: [
                    '200' => new Response(description: 'Array of communes with their tax rate and collected amount'),
                    '400' => new Response(description: 'Invalid or missing parameters (department_code, tax_type, year are required)'),
                ],
            ),
            provider: CommuneCorrelationProvider::class,
        ),
    ],
)]
#[QueryParameter(key: 'department_code', description: 'Department code (e.g. 76, 75, 2A)', schema: ['type' => 'string'], required: true)]
#[QueryParameter(key: 'tax_type', description: 'Tax type to analyze', schema: ['type' => 'string', 'enum' => ['tfpnb', 'tfpb', 'th', 'cfe']], required: true)]
#[QueryParameter(key: 'year', description: 'Year of tax data (2019-2022)', schema: ['type' => 'integer'], required: true)]
class CommuneCorrelation
{
    public function __construct(
        public readonly string $department_code = '',
        public readonly string $tax_type = '',
        public readonly ?int $year = null,
        public readonly array $data = [],
    ) {}
}

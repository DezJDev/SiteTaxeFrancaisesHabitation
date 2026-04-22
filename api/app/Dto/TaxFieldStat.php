<?php

namespace App\Dto;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\QueryParameter;
use ApiPlatform\OpenApi\Model\Operation;
use ApiPlatform\OpenApi\Model\Response;
use App\State\TaxFieldStatProvider;

#[ApiResource(
    shortName: 'TaxFieldStat',
    description: 'Sum or average of a specific tax field (tfpnb, tfpb, th, cfe)',
    paginationEnabled: false,
    operations: [
        new Get(
            uriTemplate: '/somme/{field}',
            name: 'tax_sum',
            openapi: new Operation(
                summary: 'Calculate the sum of a tax field (tfpnb, tfpb, th, cfe)',
                description: 'Returns the total sum of a tax amount field, optionally filtered by department and year.',
                responses: [
                    '200' => new Response(description: 'Sum of the requested tax field'),
                    '400' => new Response(description: 'Invalid field name (must be tfpnb, tfpb, th or cfe)'),
                ],
            ),
            provider: TaxFieldStatProvider::class,
        ),
        new Get(
            uriTemplate: '/average/{field}',
            name: 'tax_average',
            openapi: new Operation(
                summary: 'Calculate the average of a tax field (tfpnb, tfpb, th, cfe)',
                description: 'Returns the average of a tax amount field, optionally filtered by department and year.',
                responses: [
                    '200' => new Response(description: 'Average of the requested tax field'),
                    '400' => new Response(description: 'Invalid field name (must be tfpnb, tfpb, th or cfe)'),
                ],
            ),
            provider: TaxFieldStatProvider::class,
        ),
    ],
)]
#[QueryParameter(key: 'department_code', description: 'Filter by department code (e.g. 76, 75, 2A)', schema: ['type' => 'string'])]
#[QueryParameter(key: 'year', description: 'Filter by year of tax data (2019-2022)', schema: ['type' => 'integer'])]
class TaxFieldStat
{
    public function __construct(
        public readonly string $field = '',
        public readonly ?float $sum = null,
        public readonly ?float $average = null,
        public readonly array $filters = [],
    ) {}
}

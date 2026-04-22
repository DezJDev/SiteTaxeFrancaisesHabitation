<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Dto\TaxTimeSeries;
use App\Models\Taxe;
use App\Services\TaxeStatService;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class TaxTimeSeriesProvider implements ProviderInterface
{
    public function __construct(
        private readonly TaxeStatService $taxeStatService,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): TaxTimeSeries
    {
        $request = $context['request'] ?? null;

        $regionParam = $request?->query->get('region');
        $taxType = $request?->query->get('tax_type');
        $startYear = $request?->query->get('start_year');
        $endYear = $request?->query->get('end_year');

        if (!$taxType || !in_array($taxType, Taxe::ALLOWED_STAT_FIELDS, true)) {
            throw new BadRequestHttpException(
                sprintf('Invalid tax_type "%s". Allowed: %s', $taxType, implode(', ', Taxe::ALLOWED_STAT_FIELDS))
            );
        }

        $regions = $regionParam
            ? array_map('trim', explode(',', $regionParam))
            : [];

        $startYearInt = $startYear !== null ? (int) $startYear : null;
        $endYearInt = $endYear !== null ? (int) $endYear : null;

        $data = $this->taxeStatService->getTimeSeries($regions, $taxType, $startYearInt, $endYearInt);

        return new TaxTimeSeries(
            regions: $regions,
            tax_type: $taxType,
            start_year: $startYearInt,
            end_year: $endYearInt,
            data: $data,
        );
    }
}

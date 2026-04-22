<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Dto\RegionDistribution;
use App\Models\Taxe;
use App\Services\TaxeStatService;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class RegionDistributionProvider implements ProviderInterface
{
    public function __construct(
        private readonly TaxeStatService $taxeStatService,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): RegionDistribution
    {
        $request = $context['request'] ?? null;

        $taxType = $request?->query->get('tax_type');
        $year = $request?->query->get('year');

        if (!$taxType || !in_array($taxType, Taxe::ALLOWED_STAT_FIELDS, true)) {
            throw new BadRequestHttpException(
                sprintf('Invalid tax_type "%s". Allowed: %s', $taxType, implode(', ', Taxe::ALLOWED_STAT_FIELDS))
            );
        }

        $yearInt = $year !== null ? (int) $year : null;

        $data = $this->taxeStatService->getDistribution($taxType, $yearInt);

        return new RegionDistribution(
            tax_type: $taxType,
            year: $yearInt,
            data: $data,
        );
    }
}

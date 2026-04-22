<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Dto\TaxGlobalStat;
use App\Services\TaxeStatService;

class TaxGlobalStatProvider implements ProviderInterface
{
    public function __construct(
        private readonly TaxeStatService $taxeStatService,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): TaxGlobalStat
    {
        $request = $context['request'] ?? null;

        $groupBy = $request?->query->get('group_by', 'department') ?? 'department';
        $year = $request?->query->get('year');
        $yearInt = $year !== null ? (int) $year : null;

        $data = $this->taxeStatService->getStatsByLocation($groupBy, $yearInt);

        return new TaxGlobalStat(
            group_by: $groupBy,
            year: $yearInt ?? 'all',
            data: $data,
        );
    }
}

<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Dto\CommuneCorrelation;
use App\Models\Department;
use App\Models\Taxe;
use App\Services\TaxeStatService;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class CommuneCorrelationProvider implements ProviderInterface
{
    public function __construct(
        private readonly TaxeStatService $taxeStatService,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): CommuneCorrelation
    {
        $request = $context['request'] ?? null;

        $departmentCode = $request?->query->get('department_code');
        $taxType = $request?->query->get('tax_type');
        $year = $request?->query->get('year');

        if (!$departmentCode) {
            throw new BadRequestHttpException('The "department_code" parameter is required.');
        }

        $departmentId = Department::where('department_code', $departmentCode)->value('id');
        if (!$departmentId) {
            throw new BadRequestHttpException(sprintf('Department "%s" not found.', $departmentCode));
        }

        if (!$taxType || !in_array($taxType, Taxe::ALLOWED_STAT_FIELDS, true)) {
            throw new BadRequestHttpException(
                sprintf('Invalid tax_type "%s". Allowed: %s', $taxType, implode(', ', Taxe::ALLOWED_STAT_FIELDS))
            );
        }

        if (!$year) {
            throw new BadRequestHttpException('The "year" parameter is required.');
        }

        $yearInt = (int) $year;

        $data = $this->taxeStatService->getCorrelation($departmentId, $taxType, $yearInt);

        return new CommuneCorrelation(
            department_code: $departmentCode,
            tax_type: $taxType,
            year: $yearInt,
            data: $data,
        );
    }
}

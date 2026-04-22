<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Dto\TaxFieldStat;
use App\Models\Department;
use App\Models\Taxe;
use App\Services\TaxeStatService;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class TaxFieldStatProvider implements ProviderInterface
{
    public function __construct(
        private readonly TaxeStatService $taxeStatService,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): TaxFieldStat
    {
        $field = $uriVariables['field'] ?? null;

        if (!$field || !in_array($field, Taxe::ALLOWED_STAT_FIELDS, true)) {
            throw new BadRequestHttpException(
                sprintf('Invalid field "%s". Allowed: %s', $field, implode(', ', Taxe::ALLOWED_STAT_FIELDS))
            );
        }

        $request = $context['request'] ?? null;
        $departmentCode = $request?->query->get('department_code');
        $year = $request?->query->get('year');
        $yearInt = $year !== null ? (int) $year : null;

        $departmentId = null;
        if ($departmentCode !== null) {
            $departmentId = Department::where('department_code', $departmentCode)->value('id');
            if (!$departmentId) {
                throw new BadRequestHttpException(sprintf('Department "%s" not found.', $departmentCode));
            }
        }

        $filters = array_filter([
            'department_code' => $departmentCode,
            'year' => $yearInt,
        ], fn ($v) => $v !== null);

        $operationName = $operation->getName();

        if (str_contains($operationName, 'sum')) {
            $sum = $this->taxeStatService->calculateSum($field, $departmentId, $yearInt);

            return new TaxFieldStat(field: $field, sum: $sum, filters: $filters);
        }

        $average = $this->taxeStatService->calculateAverage($field, $departmentId, $yearInt);

        return new TaxFieldStat(field: $field, average: $average, filters: $filters);
    }
}

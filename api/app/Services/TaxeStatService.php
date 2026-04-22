<?php

namespace App\Services;

use App\Models\Taxe;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class TaxeStatService
{
    /**
     * Calculate sum for a specific tax field with optional filters.
     */
    public function calculateSum(string $field, ?int $departmentId = null, ?int $year = null): float
    {
        $column = $this->validateAndGetColumn($field);
        $query = $this->buildBaseQuery($departmentId, $year);

        return $query->sum($column);
    }

    /**
     * Calculate average for a specific tax field with optional filters.
     */
    public function calculateAverage(string $field, ?int $departmentId = null, ?int $year = null): float
    {
        $column = $this->validateAndGetColumn($field);
        $query = $this->buildBaseQuery($departmentId, $year);

        return round($query->avg($column), 2);
    }

    /**
     * Get statistics grouped by location (department or region).
     */
    public function getStatsByLocation(string $groupBy = 'department', ?int $year = null): array
    {
        // Validate groupBy parameter (whitelist approach)
        if (!in_array($groupBy, ['department', 'region'], true)) {
            throw new InvalidArgumentException('Le paramètre group_by doit être "department" ou "region".');
        }

        $query = Taxe::query();
        $query->join('departments', 'taxes.department_id', '=', 'departments.id');

        // Setup grouping
        if ($groupBy === 'region') {
            $query->groupBy('departments.region_name');
            $query->select('departments.region_name as location');
        } else {
            $query->groupBy('departments.department_code');
            $query->select('departments.department_code as location');
        }

        // Apply year filter if provided
        if ($year !== null) {
            $query->where('taxes.year', $year);
        }

        // Build aggregate selects
        $sqlSelects = $this->buildAggregateSelects();
        $query->addSelect(DB::raw(implode(', ', $sqlSelects)));

        return $query->get()->toArray();
    }

    /**
     * Get time series data: average tax rate by year, grouped by region.
     *
     * @param  array  $regions  Region names to filter (empty = all regions)
     */
    public function getTimeSeries(array $regions, string $taxType, ?int $startYear = null, ?int $endYear = null): array
    {
        $this->validateAndGetColumn($taxType);
        $rateColumn = $taxType . '_percentage';

        $query = Taxe::query()
            ->join('departments', 'taxes.department_id', '=', 'departments.id')
            ->groupBy('departments.region_name', 'taxes.year')
            ->orderBy('departments.region_name')
            ->orderBy('taxes.year')
            ->select(
                'departments.region_name as region',
                'taxes.year',
                DB::raw("ROUND(AVG(taxes.{$rateColumn}), 2) as avg_rate"),
            );

        if (!empty($regions)) {
            $query->whereIn('departments.region_name', $regions);
        }

        if ($startYear !== null) {
            $query->where('taxes.year', '>=', $startYear);
        }
        if ($endYear !== null) {
            $query->where('taxes.year', '<=', $endYear);
        }

        $rows = $query->get();

        $grouped = [];
        foreach ($rows as $row) {
            $grouped[$row->region][] = [
                'year' => $row->year,
                'avg_rate' => $row->avg_rate,
            ];
        }

        return $grouped;
    }

    /**
     * Get correlation data: rate vs amount per commune for scatter plot.
     */
    public function getCorrelation(int $departmentId, string $taxType, int $year): array
    {
        $this->validateAndGetColumn($taxType);
        $rateColumn = $taxType . '_percentage';
        $amountColumn = $taxType . '_amount';

        return Taxe::query()
            ->where('department_id', $departmentId)
            ->where('year', $year)
            ->select('commune_name', "{$rateColumn} as rate", "{$amountColumn} as amount")
            ->get()
            ->toArray();
    }

    /**
     * Get distribution data: total collected volume per region for pie chart.
     */
    public function getDistribution(string $taxType, ?int $year = null): array
    {
        $this->validateAndGetColumn($taxType);
        $amountColumn = $taxType . '_amount';

        $query = Taxe::query()
            ->join('departments', 'taxes.department_id', '=', 'departments.id')
            ->groupBy('departments.region_name')
            ->select('departments.region_name as region', DB::raw("SUM(taxes.{$amountColumn}) as total_amount"))
            ->orderByDesc('total_amount');

        if ($year !== null) {
            $query->where('taxes.year', $year);
        }

        return $query->get()->toArray();
    }

    /**
     * Validate field and return the corresponding column name.
     */
    private function validateAndGetColumn(string $field): string
    {
        if (!in_array($field, Taxe::ALLOWED_STAT_FIELDS)) {
            throw new InvalidArgumentException('Champ invalide');
        }

        return $field . '_amount';
    }

    /**
     * Build base query with optional filters.
     */
    private function buildBaseQuery(?int $departmentId, ?int $year)
    {
        $query = Taxe::query();

        if ($departmentId !== null) {
            $query->where('department_id', $departmentId);
        }

        if ($year !== null) {
            $query->where('year', $year);
        }

        return $query;
    }

    /**
     * Build aggregate SELECT statements for stats query.
     */
    private function buildAggregateSelects(): array
    {
        $sqlSelects = [];

        // Aggregate amount fields
        foreach (Taxe::AMOUNT_FIELDS as $col => $alias) {
            $sqlSelects[] = "SUM({$col}) as {$alias}_total_amount";
            $sqlSelects[] = "ROUND(AVG({$col}), 2) as {$alias}_avg_amount";
        }

        // Aggregate percentage fields
        foreach (Taxe::PERCENTAGE_FIELDS as $col => $alias) {
            $sqlSelects[] = "ROUND(AVG({$col}), 2) as {$alias}_avg_rate";
        }

        return $sqlSelects;
    }
}

<?php

namespace App\Filters;

use ApiPlatform\Laravel\Eloquent\Filter\FilterInterface;
use ApiPlatform\Metadata\Parameter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

final class DepartmentSearchFilter implements FilterInterface
{
    /**
     * @param Builder<Model>       $builder
     * @param array<string, mixed> $context
     */
    public function apply(Builder $builder, mixed $values, Parameter $parameter, array $context = []): Builder
    {
        return $builder->where(function (Builder $q) use ($values) {
            $q->where('department_code', 'ilike', "{$values}%")
              ->orWhere('department_name', 'ilike', "{$values}%");
        });
    }
}

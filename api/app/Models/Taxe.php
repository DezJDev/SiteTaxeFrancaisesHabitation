<?php

namespace App\Models;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\QueryParameter;
use ApiPlatform\OpenApi\Model\Operation;
use ApiPlatform\OpenApi\Model\Response;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use ApiPlatform\Laravel\Eloquent\Filter\EqualsFilter;

#[ApiResource(
    description: 'Tax records for French communes (TFPNB, TFPB, TH, CFE)',
    operations: [
        new GetCollection(
            openapi: new Operation(
                summary: 'List tax records for French communes',
                description: 'Returns paginated tax records with amounts and rates for each commune.',
                responses: [
                    '200' => new Response(description: 'Paginated collection of tax records'),
                ],
            ),
        ),
        new Get(
            uriTemplate: '/taxes/{id}',
            uriVariables: ['id' => new Link(fromClass: Taxe::class, identifiers: ['id'])],
            openapi: new Operation(
                summary: 'Get a single tax record by ID',
                description: 'Returns a tax record with all amounts and rates for a commune.',
                responses: [
                    '200' => new Response(description: 'Tax record details'),
                    '404' => new Response(description: 'Tax record not found'),
                ],
            ),
        ),
    ]
)]
#[QueryParameter(key: 'commune_code', description: 'Filter by commune INSEE code (e.g. 76540)', filter: EqualsFilter::class, property: 'commune_code')]
#[QueryParameter(key: 'commune_name', description: 'Filter by commune name', filter: EqualsFilter::class, property: 'commune_name')]
#[QueryParameter(key: 'department_id', description: 'Filter by department ID (integer)', filter: EqualsFilter::class, property: 'department_id')]
#[QueryParameter(key: 'year', description: 'Filter by year (2019-2022)', filter: EqualsFilter::class)]
#[QueryParameter(key: 'sort[:property]', description: 'Sort by property (e.g. sort[year]=asc)', filter: EqualsFilter::class)]

class Taxe extends Model
{
    use HasFactory;

    // Tax field constants
    public const FIELD_TFPNB = 'tfpnb';
    public const FIELD_TFPB = 'tfpb';
    public const FIELD_TH = 'th';
    public const FIELD_CFE = 'cfe';

    public const ALLOWED_STAT_FIELDS = [
        self::FIELD_TFPNB,
        self::FIELD_TFPB,
        self::FIELD_TH,
        self::FIELD_CFE,
    ];

    public const AMOUNT_FIELDS = [
        'tfpnb_amount' => self::FIELD_TFPNB,
        'tfpb_amount' => self::FIELD_TFPB,
        'th_amount' => self::FIELD_TH,
        'cfe_amount' => self::FIELD_CFE,
    ];

    public const PERCENTAGE_FIELDS = [
        'tfpnb_percentage' => self::FIELD_TFPNB,
        'tfpb_percentage' => self::FIELD_TFPB,
        'th_percentage' => self::FIELD_TH,
        'cfe_percentage' => self::FIELD_CFE,
    ];

    protected $fillable = [
        'commune_code',
        'commune_name',
        'department_id',
        'tfpnb_amount',
        'tfpnb_percentage',
        'tfpb_amount',
        'tfpb_percentage',
        'th_amount',
        'th_percentage',
        'cfe_amount',
        'cfe_percentage',
        'year'
    ];

    protected $casts = [
    'tfpnb_percentage' => 'float',
    'tfpb_percentage' => 'float',
    'th_percentage' => 'float',
    'cfe_percentage' => 'float',
    
    'tfpnb_amount' => 'float',
    'tfpb_amount' => 'float', 
    'th_amount' => 'float',
    'cfe_amount' => 'float',
    ];
    
    protected $table = 'taxes';

    public $timestamps = false;

    /**
     * Get the department that owns the tax record.
     */
    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('taxes', function (Blueprint $table) {
            // Index for year filtering
            $table->index('year', 'idx_taxes_year');

            // Index for commune code lookups
            $table->index('commune_code', 'idx_taxes_commune_code');

            // Composite index for common query pattern (department + year)
            $table->index(['department_id', 'year'], 'idx_taxes_dept_year');
        });

        Schema::table('departments', function (Blueprint $table) {
            // Index for region filtering (used in statsByLocation with group_by=region)
            $table->index('region_name', 'idx_departments_region');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('taxes', function (Blueprint $table) {
            $table->dropIndex('idx_taxes_year');
            $table->dropIndex('idx_taxes_commune_code');
            $table->dropIndex('idx_taxes_dept_year');
        });

        Schema::table('departments', function (Blueprint $table) {
            $table->dropIndex('idx_departments_region');
        });
    }
};

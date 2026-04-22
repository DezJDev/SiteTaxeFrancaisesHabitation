<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('department_code', 3)->unique();
            $table->string('department_name');
            $table->string('region_name');
        });

        Schema::create('taxes', function (Blueprint $table) {
            $table->id();
            $table->string('commune_code', 5);
            $table->string('commune_name');
            $table->foreignId('department_id')->constrained('departments');
            $table->decimal('tfpnb_amount', 15, 2);
            $table->decimal('tfpnb_percentage', 15, 5);
            $table->decimal('tfpb_amount', 15, 2);
            $table->decimal('tfpb_percentage', 15, 5);
            $table->decimal('th_amount', 15, 2);
            $table->decimal('th_percentage', 15, 5);
            $table->decimal('cfe_amount', 15, 2);
            $table->decimal('cfe_percentage', 15, 5);
            $table->integer('year');
        });

        DB::statement('CREATE VIEW regions AS SELECT DISTINCT region_name FROM departments ORDER BY region_name');
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS regions');
        Schema::dropIfExists('taxes');
        Schema::dropIfExists('departments');
    }
};

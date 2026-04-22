<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Taxe;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TaxeSeeder extends Seeder
{
    private array $departmentMap = [];

    private array $colIndex = [];

    /**
     * CSV column names to look up in the header row.
     * Each key maps to one or more possible header names (first match wins).
     */
    private const COLUMN_NAMES = [
        'department'    => ['DEPARTEMENT'],
        'commune'       => ['COMMUNE'],
        'commune_name'  => ['Libellé commune'],
        'tfpnb_rate'    => ['FNB - COMMUNE / TAUX NET'],
        'tfpnb_amount'  => ['FNB - COMMUNE / MONTANT REEL'],
        'tfpb_rate'     => ['FB - COMMUNE / TAUX NET'],
        'tfpb_amount'   => ['FB - COMMUNE / MONTANT REEL'],
        'th_rate'       => ['TH - COMMUNE / TAUX NET'],
        'th_amount'     => ['TH - COMMUNE / MONTANT REEL'],
        'cfe_rate'      => ['CFE - COMMUNE /TAUX NET', 'CFE - COMMUNE / TAUX NET'],
        'cfe_amount'    => ['CFE - COMMUNE / PRODUIT REEL NET'],
    ];

    private const CHUNK_SIZE = 500;
    private const DATA_DIR = '/srv/data';

    /**
     * CSV files to import: year => path relative to DATA_DIR.
     * Add new years here as needed.
     */
    private const CSV_FILES = [
        2019 => 'rei-2019/REI_2019.csv',
        2020 => 'rei-2020/REI_2020.csv',
        2021 => 'rei-2021/REI_2021.csv',
        2022 => 'rei-2022/REI_2022.csv',
    ];

    public function run(): void
    {
        $this->departmentMap = Department::pluck('id', 'department_code')->toArray();
        $totalImported = 0;

        foreach (self::CSV_FILES as $year => $relativePath) {
            $csvPath = self::DATA_DIR . '/' . $relativePath;

            if (!file_exists($csvPath)) {
                $this->command->warn("Skipping {$year}: file not found at {$csvPath}");
                continue;
            }

            $count = $this->importYear($year, $csvPath);
            $totalImported += $count;
        }

        if ($totalImported === 0) {
            $this->command->error('No CSV files found. Make sure the data/ directory is mounted in the container.');
        } else {
            $this->command->info("Done. Total: {$totalImported} tax records imported.");
        }
    }

    private function importYear(int $year, string $csvPath): int
    {
        $handle = fopen($csvPath, 'r');
        if ($handle === false) {
            $this->command->error("Cannot open: {$csvPath}");
            return 0;
        }

        $header = fgetcsv($handle, 0, ';');
        if ($header === false) {
            $this->command->error("Empty CSV: {$csvPath}");
            fclose($handle);
            return 0;
        }

        if (!$this->buildColumnIndex($header, $year)) {
            fclose($handle);
            return 0;
        }

        $this->command->info("Importing {$year}...");

        Taxe::query()->where('year', $year)->delete();

        $batch = [];
        $count = 0;

        while (($row = fgetcsv($handle, 0, ';')) !== false) {
            $dep = trim($row[$this->colIndex['department']] ?? '');
            $com = trim($row[$this->colIndex['commune']] ?? '');
            $communeName = trim($row[$this->colIndex['commune_name']] ?? '');

            if ($dep === '' || $com === '' || !isset($this->departmentMap[$dep])) {
                continue;
            }

            $communeCode = $dep . $com;
            if (strlen($communeCode) > 5) {
                $communeCode = substr($communeCode, 0, 5);
            }

            $batch[] = [
                'commune_code' => $communeCode,
                'commune_name' => $communeName,
                'department_id' => $this->departmentMap[$dep],
                'tfpnb_amount' => $this->parseDecimal($row[$this->colIndex['tfpnb_amount']] ?? ''),
                'tfpnb_percentage' => $this->parseDecimal($row[$this->colIndex['tfpnb_rate']] ?? ''),
                'tfpb_amount' => $this->parseDecimal($row[$this->colIndex['tfpb_amount']] ?? ''),
                'tfpb_percentage' => $this->parseDecimal($row[$this->colIndex['tfpb_rate']] ?? ''),
                'th_amount' => $this->parseDecimal($row[$this->colIndex['th_amount']] ?? ''),
                'th_percentage' => $this->parseDecimal($row[$this->colIndex['th_rate']] ?? ''),
                'cfe_amount' => $this->parseDecimal($row[$this->colIndex['cfe_amount']] ?? ''),
                'cfe_percentage' => $this->parseDecimal($row[$this->colIndex['cfe_rate']] ?? ''),
                'year' => $year,
            ];

            if (count($batch) >= self::CHUNK_SIZE) {
                DB::table('taxes')->insert($batch);
                $count += count($batch);
                $batch = [];
                $this->command->getOutput()->write("\r  {$year}: {$count} rows...");
            }
        }

        if (!empty($batch)) {
            DB::table('taxes')->insert($batch);
            $count += count($batch);
        }

        fclose($handle);

        $this->command->newLine();
        $this->command->info("  {$year}: {$count} records imported.");

        return $count;
    }

    private function buildColumnIndex(array $header, int $year): bool
    {
        $this->colIndex = [];
        $trimmedHeader = array_map('trim', $header);

        foreach (self::COLUMN_NAMES as $key => $possibleNames) {
            $found = false;

            foreach ($possibleNames as $name) {
                // Try exact match first
                $index = array_search($name, $trimmedHeader, true);
                if ($index !== false) {
                    $this->colIndex[$key] = $index;
                    $found = true;
                    break;
                }

                // Fall back to "starts with" match (handles columns that gained suffixes between years)
                foreach ($trimmedHeader as $i => $headerName) {
                    if (str_starts_with($headerName, $name)) {
                        $this->colIndex[$key] = $i;
                        $found = true;
                        break 2;
                    }
                }
            }

            if (!$found) {
                $this->command->error("  {$year}: column not found for '{$key}' (tried: " . implode(', ', $possibleNames) . ')');
                return false;
            }
        }

        return true;
    }

    private function parseDecimal(string $value): float
    {
        $value = trim($value);

        if ($value === '' || $value === '-') {
            return 0.0;
        }

        $value = str_replace(',', '.', $value);
        $value = str_replace(' ', '', $value);

        return (float) $value;
    }
}

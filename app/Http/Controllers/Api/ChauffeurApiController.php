<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\SaleOrder;
use Illuminate\Support\Str;

class ChauffeurApiController extends Controller
{
    public function index()
    {
        $rows = collect()
            ->merge(
                PurchaseOrder::query()
                    ->whereNotNull('chauffeur')
                    ->where('chauffeur', '!=', '')
                    ->get(['chauffeur', 'matricule', 'updated_at', 'id'])
                    ->map(fn ($o) => [
                        'chauffeur' => $o->chauffeur,
                        'matricule' => $o->matricule,
                        'at' => optional($o->updated_at)->getTimestamp() ?? 0,
                        'id' => (int) $o->id,
                    ])
            )
            ->merge(
                SaleOrder::query()
                    ->whereNotNull('chauffeur')
                    ->where('chauffeur', '!=', '')
                    ->get(['chauffeur', 'matricule', 'updated_at', 'id'])
                    ->map(fn ($o) => [
                        'chauffeur' => $o->chauffeur,
                        'matricule' => $o->matricule,
                        'at' => optional($o->updated_at)->getTimestamp() ?? 0,
                        'id' => (int) $o->id,
                    ])
            )
            ->sortByDesc(fn ($r) => [$r['at'], $r['id']])
            ->values();

        $byName = [];
        $usedMatricules = [];

        foreach ($rows as $order) {
            $nom = $this->normalizeDisplay((string) $order['chauffeur']);
            if ($nom === '') {
                continue;
            }

            $nameKey = $this->normalizeKey($nom);
            if (isset($byName[$nameKey])) {
                continue;
            }

            $matricule = $this->normalizeDisplay((string) ($order['matricule'] ?? ''));
            $matKey = $matricule !== '' ? $this->normalizeKey($matricule) : null;

            if ($matKey !== null && isset($usedMatricules[$matKey])) {
                $matricule = null;
                $matKey = null;
            }

            if ($matKey !== null) {
                $usedMatricules[$matKey] = true;
            }

            $byName[$nameKey] = [
                'nom' => $nom,
                'matricule' => $matricule !== '' ? $matricule : null,
            ];
        }

        uasort($byName, fn ($a, $b) => strcasecmp($a['nom'], $b['nom']));

        $data = collect($byName)
            ->values()
            ->map(fn (array $item, int $index) => [
                'id' => $index + 1,
                'nom' => $item['nom'],
                'matricule' => $item['matricule'],
            ])
            ->all();

        return response()->json([
            'data' => $data,
            'meta' => [
                'total' => count($data),
            ],
        ]);
    }

    private function normalizeDisplay(string $value): string
    {
        return trim(preg_replace('/\s+/u', ' ', $value) ?? '');
    }

    private function normalizeKey(string $value): string
    {
        return Str::upper($this->normalizeDisplay($value));
    }
}

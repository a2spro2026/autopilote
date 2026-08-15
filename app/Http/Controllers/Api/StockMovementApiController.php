<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class StockMovementApiController extends Controller
{
    public function index(Request $request)
    {
        $annee = (int) ($request->query('annee') ?: now()->year);
        if ($annee < 2000 || $annee > 2100) {
            $annee = (int) now()->year;
        }

        $achatsByMonth = $this->monthlyQuantities(
            'purchase_order_items',
            'purchase_orders',
            'purchase_order_id',
            'order_date',
            $annee
        );
        $ventesByMonth = $this->monthlyQuantities(
            'sales_order_items',
            'sales_orders',
            'sales_order_id',
            'order_date',
            $annee
        );

        $monthKeys = [];
        for ($m = 1; $m <= 12; $m++) {
            $monthKeys[] = sprintf('%04d-%02d', $annee, $m);
        }

        $monthLabels = collect($monthKeys)->map(fn ($ym) => [
            'key' => $ym,
            'label' => Carbon::createFromFormat('Y-m', $ym)->locale('fr')->isoFormat('MMM'),
            'label_full' => Carbon::createFromFormat('Y-m', $ym)->locale('fr')->isoFormat('MMMM'),
        ])->values()->all();

        $rows = Product::query()
            ->orderBy('reference')
            ->get()
            ->map(function (Product $product) use ($achatsByMonth, $ventesByMonth, $monthKeys) {
                $init = (float) $product->initial_stock;
                $months = [];
                $achatYear = 0.0;
                $venteYear = 0.0;

                foreach ($monthKeys as $ym) {
                    $achat = $this->qtyForProductMonth($product, $achatsByMonth, $ym);
                    $vente = $this->qtyForProductMonth($product, $ventesByMonth, $ym);
                    $achatYear += $achat;
                    $venteYear += $vente;
                    $months[$ym] = [
                        'achats' => number_format($achat, 3, '.', ''),
                        'ventes' => number_format($vente, 3, '.', ''),
                        'label' => number_format($achat, 3, '.', '').' / '.number_format($vente, 3, '.', ''),
                    ];
                }

                // Stock = initiale + tous achats année… mieux: initiale + tous achats historiques − ventes historiques
                // Pour cohérence, recalcul global hors filtre année :
                $stock = round($init + $this->lifetimeQty($product, 'purchase') - $this->lifetimeQty($product, 'sale'), 3);

                return [
                    'id' => $product->id,
                    'reference' => $product->reference ?: ($product->article_id ?: '—'),
                    'designation' => $product->name ?: '—',
                    'qte_initiale' => number_format($init, 3, '.', ''),
                    'months' => $months,
                    'achats_annee' => number_format($achatYear, 3, '.', ''),
                    'ventes_annee' => number_format($venteYear, 3, '.', ''),
                    'qte_stock' => number_format($stock, 3, '.', ''),
                    'unit' => $product->unit,
                ];
            })
            ->values();

        return response()->json([
            'data' => $rows,
            'meta' => [
                'annee' => $annee,
                'months' => $monthLabels,
                'count' => $rows->count(),
            ],
        ]);
    }

    /**
     * Quantités par mois : by_id[product_id][Y-m] / by_ref[ref][Y-m]
     *
     * @return array{by_id: array<int, array<string, float>>, by_ref: array<string, array<string, float>>}
     */
    private function monthlyQuantities(
        string $itemsTable,
        string $ordersTable,
        string $fk,
        string $dateColumn,
        int $annee
    ): array {
        $map = ['by_id' => [], 'by_ref' => []];

        if (! Schema::hasTable($itemsTable) || ! Schema::hasTable($ordersTable)) {
            return $map;
        }

        $rows = DB::table("{$itemsTable} as it")
            ->join("{$ordersTable} as o", 'o.id', '=', "it.{$fk}")
            ->where('o.status', '!=', 'annule')
            ->whereYear("o.{$dateColumn}", $annee)
            ->selectRaw("it.product_id, it.article_ref, DATE_FORMAT(o.{$dateColumn}, '%Y-%m') as ym, SUM(it.quantity) as qty")
            ->groupBy('it.product_id', 'it.article_ref', 'ym')
            ->get();

        foreach ($rows as $row) {
            $ym = (string) $row->ym;
            $qty = (float) $row->qty;
            if ($ym === '') {
                continue;
            }
            if ($row->product_id) {
                $id = (int) $row->product_id;
                $map['by_id'][$id][$ym] = ($map['by_id'][$id][$ym] ?? 0) + $qty;
                continue;
            }
            $ref = mb_strtolower(trim((string) $row->article_ref));
            if ($ref !== '') {
                $map['by_ref'][$ref][$ym] = ($map['by_ref'][$ref][$ym] ?? 0) + $qty;
            }
        }

        return $map;
    }

    private function qtyForProductMonth(Product $product, array $map, string $ym): float
    {
        $qty = $map['by_id'][$product->id][$ym] ?? 0;
        foreach (array_unique(array_filter([
            mb_strtolower(trim((string) $product->article_id)),
            mb_strtolower(trim((string) $product->reference)),
        ])) as $ref) {
            $qty += $map['by_ref'][$ref][$ym] ?? 0;
        }

        return (float) $qty;
    }

    private function lifetimeQty(Product $product, string $type): float
    {
        static $cache = [];

        if (! isset($cache[$type])) {
            if ($type === 'purchase') {
                $cache[$type] = $this->lifetimeMap(
                    'purchase_order_items',
                    'purchase_orders',
                    'purchase_order_id',
                    'order_date'
                );
            } else {
                $cache[$type] = $this->lifetimeMap(
                    'sales_order_items',
                    'sales_orders',
                    'sales_order_id',
                    'order_date'
                );
            }
        }

        $map = $cache[$type];
        $qty = $map['by_id'][$product->id] ?? 0;
        foreach (array_unique(array_filter([
            mb_strtolower(trim((string) $product->article_id)),
            mb_strtolower(trim((string) $product->reference)),
        ])) as $ref) {
            $qty += $map['by_ref'][$ref] ?? 0;
        }

        return (float) $qty;
    }

    /** @return array{by_id: array<int,float>, by_ref: array<string,float>} */
    private function lifetimeMap(string $itemsTable, string $ordersTable, string $fk, string $dateColumn): array
    {
        $map = ['by_id' => [], 'by_ref' => []];
        if (! Schema::hasTable($itemsTable) || ! Schema::hasTable($ordersTable)) {
            return $map;
        }

        $rows = DB::table("{$itemsTable} as it")
            ->join("{$ordersTable} as o", 'o.id', '=', "it.{$fk}")
            ->where('o.status', '!=', 'annule')
            ->selectRaw('it.product_id, it.article_ref, SUM(it.quantity) as qty')
            ->groupBy('it.product_id', 'it.article_ref')
            ->get();

        foreach ($rows as $row) {
            $qty = (float) $row->qty;
            if ($row->product_id) {
                $map['by_id'][(int) $row->product_id] = ($map['by_id'][(int) $row->product_id] ?? 0) + $qty;
                continue;
            }
            $ref = mb_strtolower(trim((string) $row->article_ref));
            if ($ref !== '') {
                $map['by_ref'][$ref] = ($map['by_ref'][$ref] ?? 0) + $qty;
            }
        }

        return $map;
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class StockMouvementApiController extends Controller
{
    private const MONTH_LABELS = [
        1 => 'Jan', 2 => 'Fév', 3 => 'Mar', 4 => 'Avr',
        5 => 'Mai', 6 => 'Juin', 7 => 'Juil', 8 => 'Août',
        9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc',
    ];

    private const MONTH_FULL = [
        1 => 'Janvier', 2 => 'Février', 3 => 'Mars', 4 => 'Avril',
        5 => 'Mai', 6 => 'Juin', 7 => 'Juillet', 8 => 'Août',
        9 => 'Septembre', 10 => 'Octobre', 11 => 'Novembre', 12 => 'Décembre',
    ];

    public function index(Request $request)
    {
        $year = (int) ($request->year ?: now()->year);
        if ($year < 2000 || $year > 2100) {
            $year = (int) now()->year;
        }

        $achatsByMonth = $this->monthlyQuantities(
            'purchase_order_items',
            'purchase_orders',
            'purchase_order_id',
            'order_date',
            $year
        );

        $ventesByMonth = $this->monthlyQuantities(
            'sales_order_items',
            'sales_orders',
            'sales_order_id',
            'order_date',
            $year
        );

        $achatsTotal = $this->totalQuantities(
            'purchase_order_items',
            'purchase_orders',
            'purchase_order_id'
        );

        $ventesTotal = $this->totalQuantities(
            'sales_order_items',
            'sales_orders',
            'sales_order_id'
        );

        $products = Product::query()->orderBy('id')->get();

        $data = $products->map(function (Product $product) use ($achatsByMonth, $ventesByMonth, $achatsTotal, $ventesTotal) {
            $months = [];
            for ($m = 1; $m <= 12; $m++) {
                $achat = $this->qtyFor($product, $achatsByMonth[$m] ?? ['by_id' => [], 'by_ref' => []]);
                $vente = $this->qtyFor($product, $ventesByMonth[$m] ?? ['by_id' => [], 'by_ref' => []]);
                $months[$m] = [
                    'achat' => round($achat, 3),
                    'vente' => round($vente, 3),
                ];
            }

            $purchased = $this->qtyFor($product, $achatsTotal);
            $sold = $this->qtyFor($product, $ventesTotal);
            $stockActuel = round($purchased - $sold, 3);

            return [
                'id' => $product->id,
                'reference' => $product->reference,
                'designation' => $product->name,
                'unit' => $product->unit,
                'stock_initial' => round((float) $product->initial_stock, 3),
                'months' => $months,
                'stock_actuel' => $stockActuel,
                'purchased_qty' => round($purchased, 3),
                'sold_qty' => round($sold, 3),
            ];
        })->values()->all();

        return response()->json([
            'data' => $data,
            'meta' => [
                'year' => $year,
                'months' => collect(self::MONTH_LABELS)->map(fn ($short, $num) => [
                    'num' => $num,
                    'short' => $short,
                    'full' => self::MONTH_FULL[$num],
                ])->values()->all(),
            ],
        ]);
    }

    private function monthlyQuantities(string $itemsTable, string $ordersTable, string $fk, string $dateCol, int $year): array
    {
        $byMonth = [];
        for ($m = 1; $m <= 12; $m++) {
            $byMonth[$m] = ['by_id' => [], 'by_ref' => []];
        }

        if (! Schema::hasTable($itemsTable) || ! Schema::hasTable($ordersTable)) {
            return $byMonth;
        }

        $rows = DB::table("{$itemsTable} as i")
            ->join("{$ordersTable} as o", 'o.id', '=', "i.{$fk}")
            ->where('o.status', '!=', 'annule')
            ->whereYear("o.{$dateCol}", $year)
            ->selectRaw("i.product_id, i.article_ref, MONTH(o.{$dateCol}) as month, SUM(i.quantity) as qty")
            ->groupBy('i.product_id', 'i.article_ref', 'month')
            ->get();

        foreach ($rows as $row) {
            $month = (int) $row->month;
            if ($month < 1 || $month > 12) {
                continue;
            }
            $qty = (float) $row->qty;
            if ($row->product_id) {
                $id = (int) $row->product_id;
                $byMonth[$month]['by_id'][$id] = ($byMonth[$month]['by_id'][$id] ?? 0) + $qty;

                continue;
            }
            $ref = mb_strtolower(trim((string) $row->article_ref));
            if ($ref !== '') {
                $byMonth[$month]['by_ref'][$ref] = ($byMonth[$month]['by_ref'][$ref] ?? 0) + $qty;
            }
        }

        return $byMonth;
    }

    private function totalQuantities(string $itemsTable, string $ordersTable, string $fk): array
    {
        $map = ['by_id' => [], 'by_ref' => []];

        if (! Schema::hasTable($itemsTable) || ! Schema::hasTable($ordersTable)) {
            return $map;
        }

        $rows = DB::table("{$itemsTable} as i")
            ->join("{$ordersTable} as o", 'o.id', '=', "i.{$fk}")
            ->where('o.status', '!=', 'annule')
            ->selectRaw('i.product_id, i.article_ref, SUM(i.quantity) as qty')
            ->groupBy('i.product_id', 'i.article_ref')
            ->get();

        foreach ($rows as $row) {
            $qty = (float) $row->qty;
            if ($row->product_id) {
                $id = (int) $row->product_id;
                $map['by_id'][$id] = ($map['by_id'][$id] ?? 0) + $qty;

                continue;
            }
            $ref = mb_strtolower(trim((string) $row->article_ref));
            if ($ref !== '') {
                $map['by_ref'][$ref] = ($map['by_ref'][$ref] ?? 0) + $qty;
            }
        }

        return $map;
    }

    private function qtyFor(Product $product, array $map): float
    {
        $qty = $map['by_id'][$product->id] ?? 0;

        foreach (array_unique(array_filter([
            mb_strtolower(trim((string) $product->article_id)),
            mb_strtolower(trim((string) $product->reference)),
        ])) as $ref) {
            $qty += $map['by_ref'][$ref] ?? 0;
        }

        return (float) $qty;
    }
}

<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ProductStockCalculator
{
    private ?array $purchasedCache = null;

    private ?array $soldCache = null;

    /**
     * @return array{
     *     purchased: float,
     *     sold: float,
     *     quantity: float,
     *     stock_actuel: float,
     *     etat: string,
     *     origin: string
     * }
     */
    public function forProduct(Product $product, bool $sync = false): array
    {
        $purchased = $this->purchasedFor($product);
        $sold = $this->soldFor($product);
        $origin = $this->resolveOrigin($product, $purchased);
        $quantity = $origin === 'bon_achat' ? $purchased : (float) $product->initial_stock;
        $stockActuel = $quantity - $sold;
        $etat = $product->etatLabel($stockActuel);

        if ($sync) {
            $updates = [];
            if (abs((float) $product->quantity_in_stock - $stockActuel) > 0.0001) {
                $updates['quantity_in_stock'] = $stockActuel;
            }
            if ((string) $product->etat !== $etat) {
                $updates['etat'] = $etat;
            }
            if ($updates !== []) {
                $product->forceFill($updates)->saveQuietly();
            }
        }

        return [
            'purchased' => $purchased,
            'sold' => $sold,
            'quantity' => $quantity,
            'stock_actuel' => $stockActuel,
            'etat' => $etat,
            'origin' => $origin,
        ];
    }

    private function resolveOrigin(Product $product, float $purchased): string
    {
        $origin = (string) ($product->origin ?? '');
        if (in_array($origin, ['bon_achat', 'saisie'], true)) {
            return $origin;
        }

        return $purchased > 0 ? 'bon_achat' : 'saisie';
    }

    private function purchasedFor(Product $product): float
    {
        return $this->qtyForProduct($product, $this->purchasedQuantities());
    }

    private function soldFor(Product $product): float
    {
        return $this->qtyForProduct($product, $this->soldQuantities());
    }

    private function purchasedQuantities(): array
    {
        if ($this->purchasedCache !== null) {
            return $this->purchasedCache;
        }

        return $this->purchasedCache = $this->orderItemQuantities(
            'purchase_order_items',
            'purchase_orders',
            'purchase_order_id',
            'poi'
        );
    }

    private function soldQuantities(): array
    {
        if ($this->soldCache !== null) {
            return $this->soldCache;
        }

        return $this->soldCache = $this->orderItemQuantities(
            'sales_order_items',
            'sales_orders',
            'sales_order_id',
            'soi'
        );
    }

    private function orderItemQuantities(string $itemsTable, string $ordersTable, string $fk, string $alias): array
    {
        $map = ['by_id' => [], 'by_ref' => []];

        if (! Schema::hasTable($itemsTable) || ! Schema::hasTable($ordersTable)) {
            return $map;
        }

        $rows = DB::table("{$itemsTable} as {$alias}")
            ->join("{$ordersTable} as o", 'o.id', '=', "{$alias}.{$fk}")
            ->where('o.status', '!=', 'annule')
            ->selectRaw("{$alias}.product_id, {$alias}.article_ref, SUM({$alias}.quantity) as qty")
            ->groupBy("{$alias}.product_id", "{$alias}.article_ref")
            ->get();

        foreach ($rows as $row) {
            $qty = (float) $row->qty;

            if ($row->product_id) {
                $map['by_id'][(int) $row->product_id] = ($map['by_id'][(int) $row->product_id] ?? 0) + $qty;

                continue;
            }

            $ref = trim((string) $row->article_ref);
            if ($ref !== '') {
                $key = mb_strtolower($ref);
                $map['by_ref'][$key] = ($map['by_ref'][$key] ?? 0) + $qty;
            }
        }

        return $map;
    }

    private function qtyForProduct(Product $product, array $map): float
    {
        $qty = $map['by_id'][$product->id] ?? 0;

        $refs = array_unique(array_filter([
            mb_strtolower(trim((string) $product->article_id)),
            mb_strtolower(trim((string) $product->reference)),
        ]));

        foreach ($refs as $ref) {
            $qty += $map['by_ref'][$ref] ?? 0;
        }

        return (float) $qty;
    }
}

<?php

use App\Models\Product;
use App\Models\PurchaseOrderItem;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('purchase_order_items') || ! Schema::hasTable('products')) {
            return;
        }

        $allowedUnits = ['Kg', 'U', 'Sac', 'ML', 'M²', 'M³', 'Tn', 'M'];

        PurchaseOrderItem::query()
            ->whereNull('product_id')
            ->orderBy('id')
            ->each(function (PurchaseOrderItem $item) use ($allowedUnits) {
                DB::transaction(function () use ($item, $allowedUnits) {
                    $ref = trim((string) $item->article_ref);
                    $name = trim((string) $item->description);
                    if ($ref === '' && $name === '') {
                        return;
                    }

                    $product = null;
                    if ($ref !== '') {
                        $product = Product::query()
                            ->where(function ($q) use ($ref) {
                                $q->where('article_id', $ref)->orWhere('reference', $ref);
                            })
                            ->first();
                    }

                    if (! $product) {
                        $unit = trim((string) ($item->unit ?? ''));
                        if (! in_array($unit, $allowedUnits, true)) {
                            $unit = 'U';
                        }

                        $product = Product::create([
                            'reference' => $ref !== '' ? $ref : 'Réf-PENDING',
                            'article_id' => $ref !== '' ? $ref : null,
                            'name' => $name !== '' ? $name : ($ref !== '' ? $ref : 'Article'),
                            'unit' => $unit,
                            'famille' => $item->category,
                            'initial_stock' => 0,
                            'quantity_in_stock' => 0,
                            'min_stock_alert' => 0,
                            'status' => 'actif',
                            'etat' => 'Dispo',
                            'origin' => 'bon_achat',
                        ]);

                        if ($ref === '') {
                            $product->update([
                                'reference' => 'Réf-'.str_pad((string) $product->id, 4, '0', STR_PAD_LEFT),
                            ]);
                        }
                    } elseif (($product->origin ?? '') !== 'bon_achat') {
                        $product->update(['origin' => 'bon_achat']);
                    }

                    $item->update(['product_id' => $product->id]);
                });
            });
    }

    public function down(): void
    {
        //
    }
};

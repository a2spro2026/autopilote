<?php

use App\Models\Product;
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

        $items = DB::table('purchase_order_items')
            ->orderBy('id')
            ->get(['id', 'product_id', 'article_ref', 'code_barre', 'description', 'famille', 'marque', 'unit', 'unit_price']);

        foreach ($items as $item) {
            $ref = trim((string) ($item->article_ref ?? ''));
            $codeBarre = trim((string) ($item->code_barre ?? ''));
            $name = trim((string) ($item->description ?? ''));

            if ($ref === '' && $name === '') {
                continue;
            }

            $product = null;
            if ($ref !== '') {
                $product = Product::query()
                    ->where(function ($q) use ($ref) {
                        $q->where('article_id', $ref)->orWhere('reference', $ref);
                    })
                    ->when(
                        $codeBarre !== '',
                        fn ($q) => $q->where('code_barre', $codeBarre),
                        fn ($q) => $q->where(function ($inner) {
                            $inner->whereNull('code_barre')->orWhere('code_barre', '');
                        }),
                    )
                    ->first();
            }

            if (! $product) {
                $reference = $ref !== '' ? $ref : 'Réf-PENDING';
                if ($ref !== '' && Product::where('reference', $ref)->exists()) {
                    $reference = 'Réf-PENDING';
                }

                $unit = trim((string) ($item->unit ?? ''));
                if (! in_array($unit, ['Kg', 'U', 'Sac', 'ML', 'M²', 'M³', 'Tn', 'M'], true)) {
                    $unit = 'U';
                }

                $unitPrice = (float) ($item->unit_price ?? 0);
                $product = Product::create([
                    'reference' => $reference,
                    'article_id' => $ref !== '' ? $ref : null,
                    'code_barre' => $codeBarre !== '' ? $codeBarre : null,
                    'name' => $name !== '' ? $name : ($ref !== '' ? $ref : 'Article'),
                    'unit' => $unit,
                    'famille' => trim((string) ($item->famille ?? '')) ?: null,
                    'brand' => trim((string) ($item->marque ?? '')) ?: null,
                    'purchase_price' => $unitPrice > 0 ? $unitPrice : null,
                    'unit_price' => $unitPrice > 0 ? $unitPrice : 0,
                    'initial_stock' => 0,
                    'quantity_in_stock' => 0,
                    'min_stock_alert' => 0,
                    'status' => 'actif',
                    'etat' => 'Dispo',
                    'origin' => 'bon_achat',
                ]);

                if ($product->reference === 'Réf-PENDING' || $ref === '') {
                    $product->update([
                        'reference' => 'Réf-'.str_pad((string) $product->id, 4, '0', STR_PAD_LEFT),
                    ]);
                }
            } else {
                $updates = [];
                if ($codeBarre !== '' && blank($product->code_barre)) {
                    $updates['code_barre'] = $codeBarre;
                }
                // Nettoyer d'anciennes fusions "a · b"
                if ($codeBarre !== '' && str_contains((string) $product->code_barre, '·')) {
                    $updates['code_barre'] = $codeBarre;
                }
                if ($name !== '') {
                    $updates['name'] = $name;
                }
                if ($ref !== '' && blank($product->article_id)) {
                    $updates['article_id'] = $ref;
                }
                if ($updates !== []) {
                    $product->update($updates);
                }
            }

            if ((int) $item->product_id !== (int) $product->id) {
                DB::table('purchase_order_items')
                    ->where('id', $item->id)
                    ->update(['product_id' => $product->id]);
            }
        }

        // Remettre article_id = Code métier quand reference était le code
        Product::query()
            ->where('origin', 'bon_achat')
            ->whereNotNull('reference')
            ->where(function ($q) {
                $q->whereNull('article_id')->orWhere('article_id', '');
            })
            ->each(function (Product $product) {
                if (! str_starts_with((string) $product->reference, 'Réf-')) {
                    $product->update(['article_id' => $product->reference]);
                }
            });
    }

    public function down(): void
    {
        // Irreversible data split
    }
};

<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeriePrixSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/products_serie_prix.json');

        if (! file_exists($path)) {
            $this->command?->warn('Fichier products_serie_prix.json introuvable.');

            return;
        }

        $products = json_decode(file_get_contents($path), true);

        if (! is_array($products)) {
            $this->command?->error('JSON produits invalide.');

            return;
        }

        foreach ($products as $row) {
            Product::updateOrCreate(
                ['article_id' => $row['reference']],
                [
                    'name' => $row['name'],
                    'reference' => 'Réf-PENDING',
                    'consistance' => $row['consistance'] ?: null,
                    'unit' => $row['unit'] ?? 'U',
                    'famille' => $row['famille'] ?: null,
                    'initial_stock' => $row['initial_stock'] ?? 0,
                    'quantity_in_stock' => $row['initial_stock'] ?? 0,
                    'min_stock_alert' => 0,
                    'status' => $row['status'] ?? 'actif',
                    'etat' => $row['etat'] ?? 'Rupture',
                ]
            );
        }

        Product::orderBy('id')->each(function (Product $product) {
            if ($product->reference === 'Réf-PENDING' || ! preg_match('/^Réf-\d{4}$/', $product->reference)) {
                $product->update([
                    'reference' => 'Réf-'.str_pad((string) $product->id, 4, '0', STR_PAD_LEFT),
                ]);
            }
        });

        $this->command?->info(count($products).' produits importés depuis la série des prix.');
    }
}

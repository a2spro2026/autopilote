<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'category_id', 'name', 'reference', 'article_id', 'code_barre', 'consistance', 'unit', 'famille',
        'unit_price', 'purchase_price', 'quantity_in_stock', 'initial_stock',
        'min_stock_alert', 'brand', 'location', 'description', 'status', 'etat',
    ];

    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'quantity_in_stock' => 'decimal:3',
            'initial_stock' => 'decimal:3',
            'min_stock_alert' => 'decimal:3',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function isLowStock(): bool
    {
        return $this->quantity_in_stock <= $this->min_stock_alert;
    }

    public function etatLabel(): string
    {
        if ($this->etat) {
            return $this->etat;
        }

        $qty = (float) $this->quantity_in_stock;
        $min = (float) $this->min_stock_alert;

        if ($qty <= 0) {
            return 'Rupture';
        }

        if ($qty <= $min) {
            return 'Faible';
        }

        return 'Dispo';
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChantierBesoin extends Model
{
    protected $fillable = [
        'chantier_id', 'product_id', 'description', 'quantity_needed',
        'quantity_allocated', 'status', 'needed_by', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'quantity_needed' => 'decimal:3',
            'quantity_allocated' => 'decimal:3',
            'needed_by' => 'date',
        ];
    }

    public function chantier(): BelongsTo
    {
        return $this->belongsTo(Chantier::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}

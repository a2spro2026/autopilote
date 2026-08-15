<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientOrderItem extends Model
{
    protected $fillable = [
        'client_order_id', 'type_travaux', 'description', 'consistance', 'unit',
        'quantity', 'unit_price', 'total',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:3',
            'unit_price' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function clientOrder(): BelongsTo
    {
        return $this->belongsTo(ClientOrder::class);
    }
}

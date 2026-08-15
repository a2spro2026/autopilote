<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SaleOrder extends Model
{
    protected $table = 'sales_orders';

    protected $fillable = [
        'reference', 'bc_number', 'order_date', 'client_id',
        'designation', 'article_ref', 'unit', 'unit_price', 'quantity', 'subtotal',
        'reglement', 'echeance', 'city', 'address', 'chauffeur', 'matricule',
        'total_ht', 'tva', 'total_ttc', 'montant_paye', 'payment_action', 'status', 'notes', 'user_id',
    ];

    protected function casts(): array
    {
        return [
            'order_date' => 'date',
            'unit_price' => 'decimal:2',
            'quantity' => 'decimal:3',
            'subtotal' => 'decimal:2',
            'total_ht' => 'decimal:2',
            'tva' => 'decimal:2',
            'total_ttc' => 'decimal:2',
            'montant_paye' => 'decimal:2',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleOrderItem::class, 'sales_order_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClientOrder extends Model
{
    protected $fillable = [
        'reference', 'quote_id', 'client_id', 'order_date',
        'contact', 'city', 'chantier_type', 'budget', 'work_delay',
        'type_travaux', 'designation', 'consistance', 'unit', 'quantity', 'unit_price', 'subtotal',
        'total_ht', 'tva', 'total_ttc', 'montant_paye', 'payment_action', 'status', 'user_id',
    ];

    protected function casts(): array
    {
        return [
            'order_date' => 'date',
            'budget' => 'decimal:2',
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

    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ClientOrderItem::class);
    }

    public function paymentAllocations(): HasMany
    {
        return $this->hasMany(ClientPaymentAllocation::class);
    }
}

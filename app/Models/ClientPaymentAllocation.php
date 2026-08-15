<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientPaymentAllocation extends Model
{
    protected $fillable = [
        'client_payment_id', 'client_order_id', 'sales_order_id', 'amount', 'action',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(ClientPayment::class, 'client_payment_id');
    }

    public function clientOrder(): BelongsTo
    {
        return $this->belongsTo(ClientOrder::class);
    }

    public function saleOrder(): BelongsTo
    {
        return $this->belongsTo(SaleOrder::class, 'sales_order_id');
    }
}

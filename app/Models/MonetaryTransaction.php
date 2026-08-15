<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MonetaryTransaction extends Model
{
    protected $fillable = [
        'transaction_date',
        'coffre',
        'statut',
        'type_reglement',
        'amount',
        'beneficiary',
        'motif',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'transaction_date' => 'date',
            'amount' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

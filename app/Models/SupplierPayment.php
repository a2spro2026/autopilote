<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupplierPayment extends Model
{
    protected $fillable = [
        'reference', 'payment_date', 'supplier_id', 'reglement', 'numero', 'banque',
        'nom_tire', 'montant', 'date_decaissement', 'remarque', 'total_ttc', 'solde_ttc',
        'statut', 'user_id',
    ];

    protected function casts(): array
    {
        return [
            'payment_date' => 'date',
            'date_decaissement' => 'date',
            'montant' => 'decimal:2',
            'total_ttc' => 'decimal:2',
            'solde_ttc' => 'decimal:2',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(SupplierPaymentAllocation::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

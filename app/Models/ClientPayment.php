<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClientPayment extends Model
{
    protected $fillable = [
        'reference', 'payment_date', 'client_id', 'client_name', 'ville_chantier',
        'chantier_type', 'montant_total', 'reglement', 'numero', 'banque', 'nom_tire',
        'montant', 'date_decaissement', 'remarque', 'solde', 'statut', 'user_id',
    ];

    protected function casts(): array
    {
        return [
            'payment_date' => 'date',
            'date_decaissement' => 'date',
            'montant_total' => 'decimal:2',
            'montant' => 'decimal:2',
            'solde' => 'decimal:2',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(ClientPaymentAllocation::class);
    }
}

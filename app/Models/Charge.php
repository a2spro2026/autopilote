<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Charge extends Model
{
    protected $fillable = [
        'reference',
        'charge_date',
        'designation',
        'beneficiaire',
        'type_reglement',
        'numero',
        'banque',
        'nom_tire',
        'montant',
        'date_decaissement',
        'remarque',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'charge_date' => 'date',
            'date_decaissement' => 'date',
            'montant' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    protected $fillable = [
        'name', 'contact_person', 'email', 'phone', 'address', 'city', 'ice',
        'payment_terms', 'reglement', 'status', 'notes', 'initial_balance',
    ];

    protected function casts(): array
    {
        return [
            'initial_balance' => 'decimal:2',
        ];
    }

    public function getSoldeAttribute(): float
    {
        return (float) $this->initial_balance;
    }

    public function getCodeAttribute(): string
    {
        return 'CF-'.str_pad((string) $this->id, 4, '0', STR_PAD_LEFT);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(SupplierInvoice::class);
    }
}

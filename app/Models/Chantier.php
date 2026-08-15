<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Chantier extends Model
{
    protected $fillable = [
        'client_id', 'name', 'reference', 'address', 'city', 'start_date', 'end_date',
        'budget', 'status', 'progress', 'manager_id', 'description', 'archived',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'budget' => 'decimal:2',
            'archived' => 'boolean',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function besoins(): HasMany
    {
        return $this->hasMany(ChantierBesoin::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(ChantierAssignment::class);
    }

    public function clientInvoices(): HasMany
    {
        return $this->hasMany(ClientInvoice::class);
    }

    public function supplierInvoices(): HasMany
    {
        return $this->hasMany(SupplierInvoice::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function isDelayed(): bool
    {
        return $this->status === 'en_cours'
            && $this->end_date
            && $this->end_date->isPast()
            && $this->progress < 100;
    }
}

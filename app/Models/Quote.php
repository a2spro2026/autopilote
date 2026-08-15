<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Quote extends Model
{
    protected $fillable = [
        'reference', 'client_id', 'chantier_id', 'quote_date', 'valid_until',
        'contact', 'city', 'chantier_type', 'budget', 'work_delay',
        'type_travaux', 'designation', 'consistance', 'unit', 'quantity', 'unit_price', 'subtotal',
        'total_ht', 'tva', 'total_ttc', 'status', 'notes', 'sent_at', 'client_order_id',
    ];

    protected function casts(): array
    {
        return [
            'quote_date' => 'date',
            'valid_until' => 'date',
            'budget' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'quantity' => 'decimal:3',
            'subtotal' => 'decimal:2',
            'total_ht' => 'decimal:2',
            'tva' => 'decimal:2',
            'total_ttc' => 'decimal:2',
            'sent_at' => 'datetime',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function chantier(): BelongsTo
    {
        return $this->belongsTo(Chantier::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(QuoteItem::class);
    }

    public function clientOrder(): BelongsTo
    {
        return $this->belongsTo(ClientOrder::class);
    }

    public function statutLabel(): string
    {
        return match ($this->status) {
            'accepte' => 'Validé',
            default => 'En Attente',
        };
    }
}

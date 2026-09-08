<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    protected $fillable = [
        'name', 'contact_person', 'email', 'phone', 'address', 'city', 'ice', 'status', 'notes',
        'chantier_type', 'reglement', 'chantier_address', 'budget', 'work_delay',
        'latitude', 'longitude', 'located_at', 'photo_path',
    ];

    protected function casts(): array
    {
        return [
            'budget' => 'decimal:2',
            'latitude' => 'float',
            'longitude' => 'float',
            'located_at' => 'datetime',
        ];
    }

    public function getCodeAttribute(): string
    {
        return 'CR-'.str_pad((string) $this->id, 4, '0', STR_PAD_LEFT);
    }

    public function chantiers(): HasMany
    {
        return $this->hasMany(Chantier::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(ClientInvoice::class);
    }
}

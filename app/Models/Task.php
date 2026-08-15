<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    protected $fillable = [
        'chantier_id', 'title', 'description', 'due_date', 'priority', 'status', 'assigned_to',
    ];

    protected function casts(): array
    {
        return ['due_date' => 'date'];
    }

    public function chantier(): BelongsTo
    {
        return $this->belongsTo(Chantier::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'assigned_to');
    }
}

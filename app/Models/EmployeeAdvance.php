<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeAdvance extends Model
{
    protected $fillable = [
        'employee_id', 'amount', 'advance_date', 'reason', 'status', 'notes', 'user_id',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'advance_date' => 'date',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

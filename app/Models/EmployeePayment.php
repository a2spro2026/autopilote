<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeePayment extends Model
{
    protected $fillable = [
        'employee_id', 'period_start', 'period_end', 'base_amount',
        'advances_deducted', 'bonuses', 'net_amount', 'payment_date', 'status', 'notes', 'user_id',
    ];

    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'payment_date' => 'date',
            'base_amount' => 'decimal:2',
            'advances_deducted' => 'decimal:2',
            'bonuses' => 'decimal:2',
            'net_amount' => 'decimal:2',
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

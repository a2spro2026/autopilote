<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Document extends Model
{
    protected $fillable = [
        'title', 'type', 'file_path', 'file_name', 'mime_type', 'size',
        'documentable_type', 'documentable_id', 'chantier_id', 'user_id',
    ];

    public function documentable(): MorphTo
    {
        return $this->morphTo();
    }

    public function chantier(): BelongsTo
    {
        return $this->belongsTo(Chantier::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaleOrderItem extends Model
{
    protected $table = 'sales_order_items';

    protected $fillable = [
        'sales_order_id', 'product_id', 'article_ref', 'code_barre', 'description',
        'categorie', 'famille', 'marque', 'unit',
        'quantity', 'unit_price', 'tva_rate', 'total',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(SaleOrder::class, 'sales_order_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}

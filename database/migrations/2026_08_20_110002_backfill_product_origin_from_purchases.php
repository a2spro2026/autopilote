<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('products') || ! Schema::hasColumn('products', 'origin')) {
            return;
        }

        if (! Schema::hasTable('purchase_order_items')) {
            return;
        }

        $ids = DB::table('purchase_order_items')
            ->whereNotNull('product_id')
            ->distinct()
            ->pluck('product_id');

        if ($ids->isNotEmpty()) {
            DB::table('products')->whereIn('id', $ids)->update(['origin' => 'bon_achat']);
        }
    }

    public function down(): void
    {
        //
    }
};

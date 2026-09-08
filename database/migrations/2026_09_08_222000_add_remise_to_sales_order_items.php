<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('sales_order_items')) {
            return;
        }

        if (! Schema::hasColumn('sales_order_items', 'remise')) {
            DB::statement('ALTER TABLE sales_order_items ADD remise DECIMAL(8,2) NOT NULL DEFAULT 0 AFTER unit_price');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('sales_order_items') && Schema::hasColumn('sales_order_items', 'remise')) {
            DB::statement('ALTER TABLE sales_order_items DROP COLUMN remise');
        }
    }
};

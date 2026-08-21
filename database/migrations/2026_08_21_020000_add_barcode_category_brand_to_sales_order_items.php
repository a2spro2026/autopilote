<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales_order_items', function (Blueprint $table) {
            $table->string('barcode', 100)->nullable()->after('article_ref');
            $table->string('category', 100)->nullable()->after('barcode');
            $table->string('brand', 100)->nullable()->after('category');
        });
    }

    public function down(): void
    {
        Schema::table('sales_order_items', function (Blueprint $table) {
            $table->dropColumn(['barcode', 'category', 'brand']);
        });
    }
};

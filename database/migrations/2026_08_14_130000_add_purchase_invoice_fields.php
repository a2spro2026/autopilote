<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('supplier_invoices', function (Blueprint $table) {
            $table->string('payment_mode', 100)->nullable()->after('invoice_date');
            $table->string('photo_path')->nullable()->after('notes');
        });

        Schema::table('supplier_invoice_items', function (Blueprint $table) {
            $table->string('article_reference', 100)->nullable()->after('product_id');
        });
    }

    public function down(): void
    {
        Schema::table('supplier_invoice_items', function (Blueprint $table) {
            $table->dropColumn('article_reference');
        });

        Schema::table('supplier_invoices', function (Blueprint $table) {
            $table->dropColumn(['payment_mode', 'photo_path']);
        });
    }
};

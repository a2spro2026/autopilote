<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('products') || Schema::hasColumn('products', 'barcode')) {
            return;
        }

        Schema::table('products', function (Blueprint $table) {
            $table->string('barcode', 100)->nullable()->after('code_barre');
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('products') || ! Schema::hasColumn('products', 'barcode')) {
            return;
        }

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('barcode');
        });
    }
};

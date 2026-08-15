<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->decimal('quantity', 12, 3)->default(1)->after('unit');
        });

        Schema::table('client_orders', function (Blueprint $table) {
            $table->decimal('quantity', 12, 3)->default(1)->after('unit');
        });
    }

    public function down(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->dropColumn('quantity');
        });

        Schema::table('client_orders', function (Blueprint $table) {
            $table->dropColumn('quantity');
        });
    }
};

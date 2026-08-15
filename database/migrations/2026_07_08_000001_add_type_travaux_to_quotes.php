<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quotes', function (Blueprint $table) {
            $table->string('type_travaux', 100)->nullable()->after('work_delay');
        });

        Schema::table('quote_items', function (Blueprint $table) {
            $table->string('type_travaux', 100)->nullable()->after('quote_id');
        });

        Schema::table('client_orders', function (Blueprint $table) {
            $table->string('type_travaux', 100)->nullable()->after('work_delay');
        });

        Schema::table('client_order_items', function (Blueprint $table) {
            $table->string('type_travaux', 100)->nullable()->after('client_order_id');
        });
    }

    public function down(): void
    {
        Schema::table('client_order_items', function (Blueprint $table) {
            $table->dropColumn('type_travaux');
        });

        Schema::table('client_orders', function (Blueprint $table) {
            $table->dropColumn('type_travaux');
        });

        Schema::table('quote_items', function (Blueprint $table) {
            $table->dropColumn('type_travaux');
        });

        Schema::table('quotes', function (Blueprint $table) {
            $table->dropColumn('type_travaux');
        });
    }
};

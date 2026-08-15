<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales_orders', function (Blueprint $table) {
            if (! Schema::hasColumn('sales_orders', 'montant_paye')) {
                $table->decimal('montant_paye', 14, 2)->default(0)->after('total_ttc');
            }
            if (! Schema::hasColumn('sales_orders', 'payment_action')) {
                $table->string('payment_action', 20)->nullable()->after('montant_paye');
            }
        });

        if (! Schema::hasColumn('client_payment_allocations', 'sales_order_id')) {
            Schema::table('client_payment_allocations', function (Blueprint $table) {
                $table->foreignId('sales_order_id')->nullable()->after('client_order_id')->constrained('sales_orders')->nullOnDelete();
            });
        }

        try {
            DB::statement('ALTER TABLE client_payment_allocations MODIFY client_order_id BIGINT UNSIGNED NULL');
        } catch (\Throwable $e) {
            // already nullable or non-MySQL
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('client_payment_allocations', 'sales_order_id')) {
            Schema::table('client_payment_allocations', function (Blueprint $table) {
                $table->dropConstrainedForeignId('sales_order_id');
            });
        }

        Schema::table('sales_orders', function (Blueprint $table) {
            $cols = array_filter(['montant_paye', 'payment_action'], fn ($c) => Schema::hasColumn('sales_orders', $c));
            if ($cols) {
                $table->dropColumn($cols);
            }
        });
    }
};

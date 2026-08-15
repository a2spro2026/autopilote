<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('client_orders', function (Blueprint $table) {
            if (! Schema::hasColumn('client_orders', 'payment_action')) {
                $table->string('payment_action', 20)->nullable()->after('montant_paye');
            }
        });

        Schema::table('client_payments', function (Blueprint $table) {
            if (! Schema::hasColumn('client_payments', 'date_decaissement')) {
                $table->date('date_decaissement')->nullable()->after('montant');
            }
            if (! Schema::hasColumn('client_payments', 'remarque')) {
                $table->text('remarque')->nullable()->after('date_decaissement');
            }
            if (! Schema::hasColumn('client_payments', 'statut')) {
                $table->string('statut', 20)->default('Inst')->after('solde');
            }
        });

        Schema::table('client_payment_allocations', function (Blueprint $table) {
            if (! Schema::hasColumn('client_payment_allocations', 'action')) {
                $table->string('action', 20)->nullable()->after('amount');
            }
        });
    }

    public function down(): void
    {
        Schema::table('client_payment_allocations', function (Blueprint $table) {
            if (Schema::hasColumn('client_payment_allocations', 'action')) {
                $table->dropColumn('action');
            }
        });

        Schema::table('client_payments', function (Blueprint $table) {
            $cols = array_filter(['date_decaissement', 'remarque', 'statut'], fn ($c) => Schema::hasColumn('client_payments', $c));
            if ($cols) {
                $table->dropColumn($cols);
            }
        });

        Schema::table('client_orders', function (Blueprint $table) {
            if (Schema::hasColumn('client_orders', 'payment_action')) {
                $table->dropColumn('payment_action');
            }
        });
    }
};

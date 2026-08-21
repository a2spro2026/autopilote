<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('client_payments', function (Blueprint $table) {
            if (! Schema::hasColumn('client_payments', 'endosse_supplier_payment_id')) {
                $table->foreignId('endosse_supplier_payment_id')
                    ->nullable()
                    ->after('user_id')
                    ->constrained('supplier_payments')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('client_payments', function (Blueprint $table) {
            if (Schema::hasColumn('client_payments', 'endosse_supplier_payment_id')) {
                $table->dropConstrainedForeignId('endosse_supplier_payment_id');
            }
        });
    }
};

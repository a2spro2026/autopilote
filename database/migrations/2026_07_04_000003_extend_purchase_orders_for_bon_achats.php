<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->string('designation')->nullable()->after('chantier_id');
            $table->string('consistance', 10)->nullable()->after('designation');
            $table->string('unit', 20)->nullable()->after('consistance');
            $table->decimal('unit_price', 14, 2)->default(0)->after('unit');
            $table->decimal('quantity', 12, 3)->default(1)->after('unit_price');
            $table->decimal('subtotal', 14, 2)->default(0)->after('quantity');
            $table->string('reglement', 10)->nullable()->after('subtotal');
            $table->string('echeance', 20)->nullable()->after('reglement');
            $table->string('city')->nullable()->after('echeance');
            $table->text('address')->nullable()->after('city');
            $table->string('chantier_type', 20)->nullable()->after('address');
            $table->string('responsible_name')->nullable()->after('chantier_type');
        });
    }

    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropColumn([
                'designation', 'consistance', 'unit', 'unit_price', 'quantity',
                'subtotal', 'reglement', 'echeance', 'city', 'address',
                'chantier_type', 'responsible_name',
            ]);
        });
    }
};

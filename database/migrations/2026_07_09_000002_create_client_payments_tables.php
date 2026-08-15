<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('client_orders', function (Blueprint $table) {
            $table->decimal('montant_paye', 14, 2)->default(0)->after('total_ttc');
        });

        Schema::create('client_payments', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->date('payment_date');
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->string('client_name')->nullable();
            $table->string('ville_chantier')->nullable();
            $table->string('chantier_type', 20)->nullable();
            $table->decimal('montant_total', 14, 2)->default(0);
            $table->string('reglement', 10)->nullable();
            $table->string('numero', 50)->nullable();
            $table->string('banque', 100)->nullable();
            $table->string('nom_tire', 150)->nullable();
            $table->decimal('montant', 14, 2)->default(0);
            $table->decimal('solde', 14, 2)->default(0);
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('client_payment_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_payment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_order_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 14, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_payment_allocations');
        Schema::dropIfExists('client_payments');

        Schema::table('client_orders', function (Blueprint $table) {
            $table->dropColumn('montant_paye');
        });
    }
};

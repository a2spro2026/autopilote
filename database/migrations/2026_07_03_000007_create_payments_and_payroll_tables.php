<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['client', 'fournisseur', 'personnel']);
            $table->string('payable_type');
            $table->unsignedBigInteger('payable_id');
            $table->decimal('amount', 14, 2);
            $table->date('payment_date');
            $table->enum('method', ['especes', 'cheque', 'virement', 'carte'])->default('virement');
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->index(['payable_type', 'payable_id']);
        });

        Schema::create('employee_advances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->date('advance_date');
            $table->string('reason')->nullable();
            $table->enum('status', ['en_cours', 'deduite', 'annulee'])->default('en_cours');
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('employee_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('base_amount', 12, 2)->default(0);
            $table->decimal('advances_deducted', 12, 2)->default(0);
            $table->decimal('bonuses', 12, 2)->default(0);
            $table->decimal('net_amount', 12, 2)->default(0);
            $table->date('payment_date')->nullable();
            $table->enum('status', ['brouillon', 'valide', 'paye'])->default('brouillon');
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_payments');
        Schema::dropIfExists('employee_advances');
        Schema::dropIfExists('payments');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('supplier_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->constrained()->cascadeOnDelete();
            $table->foreignId('chantier_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reference')->unique();
            $table->date('invoice_date');
            $table->date('due_date')->nullable();
            $table->decimal('total_ht', 14, 2)->default(0);
            $table->decimal('tva', 14, 2)->default(0);
            $table->decimal('total_ttc', 14, 2)->default(0);
            $table->decimal('amount_paid', 14, 2)->default(0);
            $table->enum('status', ['brouillon', 'en_attente', 'partielle', 'payee', 'en_retard', 'annulee'])->default('en_attente');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('supplier_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_invoice_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('description');
            $table->decimal('quantity', 12, 3)->default(1);
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('total', 14, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('client_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->foreignId('chantier_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reference')->unique();
            $table->date('invoice_date');
            $table->date('due_date')->nullable();
            $table->decimal('total_ht', 14, 2)->default(0);
            $table->decimal('tva', 14, 2)->default(0);
            $table->decimal('total_ttc', 14, 2)->default(0);
            $table->decimal('amount_paid', 14, 2)->default(0);
            $table->enum('status', ['brouillon', 'en_attente', 'partielle', 'payee', 'en_retard', 'annulee'])->default('en_attente');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('client_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_invoice_id')->constrained()->cascadeOnDelete();
            $table->string('description');
            $table->decimal('quantity', 12, 3)->default(1);
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('total', 14, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_invoice_items');
        Schema::dropIfExists('client_invoices');
        Schema::dropIfExists('supplier_invoice_items');
        Schema::dropIfExists('supplier_invoices');
    }
};

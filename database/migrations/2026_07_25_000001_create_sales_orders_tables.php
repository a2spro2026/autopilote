<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('bc_number')->nullable();
            $table->date('order_date');
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->string('designation')->nullable();
            $table->string('article_ref')->nullable();
            $table->string('unit', 20)->nullable();
            $table->decimal('unit_price', 14, 2)->default(0);
            $table->decimal('quantity', 12, 3)->default(1);
            $table->decimal('subtotal', 14, 2)->default(0);
            $table->string('reglement', 10)->nullable();
            $table->string('echeance', 20)->nullable();
            $table->string('city')->nullable();
            $table->string('address')->nullable();
            $table->string('chauffeur')->nullable();
            $table->string('matricule')->nullable();
            $table->decimal('total_ht', 14, 2)->default(0);
            $table->decimal('tva', 14, 2)->default(0);
            $table->decimal('total_ttc', 14, 2)->default(0);
            $table->string('status', 20)->default('valide');
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('sales_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('article_ref')->nullable();
            $table->string('description');
            $table->string('unit', 20)->nullable();
            $table->decimal('quantity', 12, 3);
            $table->decimal('unit_price', 12, 2);
            $table->decimal('tva_rate', 5, 2)->default(0);
            $table->decimal('total', 14, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_order_items');
        Schema::dropIfExists('sales_orders');
    }
};

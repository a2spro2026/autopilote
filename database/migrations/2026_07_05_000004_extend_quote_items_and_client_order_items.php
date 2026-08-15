<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quote_items', function (Blueprint $table) {
            $table->string('consistance', 10)->nullable()->after('description');
            $table->string('unit', 20)->nullable()->after('consistance');
        });

        Schema::create('client_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_order_id')->constrained()->cascadeOnDelete();
            $table->string('description');
            $table->string('consistance', 10)->nullable();
            $table->string('unit', 20)->nullable();
            $table->decimal('quantity', 12, 3)->default(1);
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('total', 14, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_order_items');

        Schema::table('quote_items', function (Blueprint $table) {
            $table->dropColumn(['consistance', 'unit']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('catalog_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('category')->nullable();
            $table->string('brand')->nullable();
            $table->text('description')->nullable();
            $table->string('photo_path')->nullable();
            $table->decimal('price', 12, 2)->nullable();
            $table->timestamps();

            $table->unique('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catalog_products');
    }
};

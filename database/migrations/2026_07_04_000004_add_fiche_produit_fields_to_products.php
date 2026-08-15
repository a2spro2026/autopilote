<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('consistance', 10)->nullable()->after('name');
            $table->string('famille')->nullable()->after('unit');
            $table->decimal('initial_stock', 12, 3)->default(0)->after('quantity_in_stock');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['consistance', 'famille', 'initial_stock']);
        });
    }
};

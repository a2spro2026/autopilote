<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales_order_items', function (Blueprint $table) {
            $table->string('code_barre', 100)->nullable()->after('article_ref');
            $table->string('categorie')->nullable()->after('description');
            $table->string('famille')->nullable()->after('categorie');
            $table->string('marque')->nullable()->after('famille');
        });
    }

    public function down(): void
    {
        Schema::table('sales_order_items', function (Blueprint $table) {
            $table->dropColumn(['code_barre', 'categorie', 'famille', 'marque']);
        });
    }
};

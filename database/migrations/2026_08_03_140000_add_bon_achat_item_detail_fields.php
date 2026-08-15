<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_order_items', function (Blueprint $table) {
            $table->string('code_barre', 100)->nullable()->after('article_ref');
            $table->string('categorie')->nullable()->after('description');
            $table->string('famille')->nullable()->after('categorie');
            $table->string('marque')->nullable()->after('famille');
        });

        if (! Schema::hasColumn('products', 'code_barre')) {
            Schema::table('products', function (Blueprint $table) {
                $table->string('code_barre', 100)->nullable()->after('article_id');
            });
        }
    }

    public function down(): void
    {
        Schema::table('purchase_order_items', function (Blueprint $table) {
            $table->dropColumn(['code_barre', 'categorie', 'famille', 'marque']);
        });

        if (Schema::hasColumn('products', 'code_barre')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('code_barre');
            });
        }
    }
};

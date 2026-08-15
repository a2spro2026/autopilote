<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('article_id', 50)->nullable()->after('reference');
        });

        DB::table('products')->orderBy('id')->each(function ($product) {
            $articleId = $product->reference;
            if (preg_match('/^Réf-\d{4}$/', $articleId)) {
                return;
            }

            DB::table('products')->where('id', $product->id)->update([
                'article_id' => $articleId,
                'reference' => 'Réf-'.str_pad((string) $product->id, 4, '0', STR_PAD_LEFT),
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('article_id');
        });
    }
};

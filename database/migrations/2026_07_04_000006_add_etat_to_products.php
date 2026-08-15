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
            $table->enum('etat', ['Dispo', 'Faible', 'Rupture'])->default('Rupture')->after('status');
        });

        DB::table('products')->orderBy('id')->each(function ($product) {
            $qty = (float) $product->quantity_in_stock;
            $min = (float) $product->min_stock_alert;

            $etat = 'Dispo';
            if ($qty <= 0) {
                $etat = 'Rupture';
            } elseif ($qty <= $min) {
                $etat = 'Faible';
            }

            DB::table('products')->where('id', $product->id)->update(['etat' => $etat]);
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('etat');
        });
    }
};

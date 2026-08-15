<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->string('bc_number')->nullable()->after('reference');
            $table->string('client_livre')->nullable()->after('city');
            $table->string('chauffeur')->nullable()->after('client_livre');
            $table->string('matricule')->nullable()->after('chauffeur');
            $table->string('article_ref')->nullable()->after('designation');
        });
    }

    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropColumn(['bc_number', 'client_livre', 'chauffeur', 'matricule', 'article_ref']);
        });
    }
};

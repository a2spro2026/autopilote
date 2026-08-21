<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('client_payments', function (Blueprint $table) {
            if (! Schema::hasColumn('client_payments', 'tresorerie')) {
                $table->string('tresorerie', 255)->nullable()->after('montant');
            }
        });
    }

    public function down(): void
    {
        Schema::table('client_payments', function (Blueprint $table) {
            if (Schema::hasColumn('client_payments', 'tresorerie')) {
                $table->dropColumn('tresorerie');
            }
        });
    }
};

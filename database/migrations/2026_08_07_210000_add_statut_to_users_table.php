<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'statut')) {
                $table->string('statut', 30)->nullable()->after('phone');
            }
        });

        DB::table('users')
            ->whereNull('statut')
            ->orWhere('statut', '')
            ->update(['statut' => 'Gerant']);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'statut')) {
                $table->dropColumn('statut');
            }
        });
    }
};

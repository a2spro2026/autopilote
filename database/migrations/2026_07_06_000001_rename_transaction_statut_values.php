<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE monetary_transactions MODIFY COLUMN statut VARCHAR(10) NOT NULL');
        }

        DB::table('monetary_transactions')->where('statut', 'Débit')->update(['statut' => 'Sortie']);
        DB::table('monetary_transactions')->where('statut', 'Crédit')->update(['statut' => 'Entrée']);
    }

    public function down(): void
    {
        DB::table('monetary_transactions')->where('statut', 'Sortie')->update(['statut' => 'Débit']);
        DB::table('monetary_transactions')->where('statut', 'Entrée')->update(['statut' => 'Crédit']);
    }
};

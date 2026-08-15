<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monetary_transactions', function (Blueprint $table) {
            $table->id();
            $table->date('transaction_date');
            $table->enum('coffre', ['Caisse', 'Cmpt Pers', 'Cmpt Ste']);
            $table->enum('statut', ['Débit', 'Crédit']);
            $table->enum('type_reglement', ['Esp', 'Chq', 'Eff', 'Vir', 'Vers'])->nullable();
            $table->decimal('amount', 14, 2);
            $table->string('beneficiary');
            $table->text('motif')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monetary_transactions');
    }
};

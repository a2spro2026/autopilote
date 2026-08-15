<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('charges', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 30)->unique();
            $table->date('charge_date');
            $table->string('designation')->nullable();
            $table->string('beneficiaire');
            $table->string('type_reglement', 20)->nullable();
            $table->string('numero', 100)->nullable();
            $table->string('banque', 100)->nullable();
            $table->string('nom_tire')->nullable();
            $table->decimal('montant', 14, 2)->default(0);
            $table->date('date_decaissement')->nullable();
            $table->text('remarque')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('charges');
    }
};
